import os
from typing import List
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich import box

from educagent.agents.query_agent import query_agent, RAGQueryAgentInputSchema, RAGQueryAgentOutputSchema
from educagent.agents.socratic_agent import qa_agent, RAGQuestionAnsweringAgentInputSchema, RAGQuestionAnsweringAgentOutputSchema
from educagent.agents.welcome_agent import welcome_agent, WelcomeAgentInputSchema, WelcomeAgentOutputSchema
from educagent.services.memory import shared_memory
from educagent.context_providers import RAGContextProvider, ChunkItem
from educagent.services.factory import create_vector_db_service
from educagent.services.base import BaseVectorDBService
from educagent.config import VECTOR_DB_TYPE, DOCUMENT_DIR
from educagent.utils import *

load_dotenv()


WELCOME_MESSAGE = """
Welcome to EducAgent - Your Personal Causality Tutor!

I'm here to help you learn causality concepts through personalized, Socratic dialogue.
To provide the best learning experience, I'd like to know a bit about you first.

Please tell me:
• Your background (field of study, profession, or general interest)
• What you already know about causality (if anything)
• What specific causality concepts you'd like to explore

Using vector database: {db_type}
"""

STARTER_EXAMPLES = [
    "I am a computer science student with no knowledge of causality. I want to understand how it applies to debugging and system design.",
    "I have a background in psychology and want to learn about causal inference for research design.",
    "I am a medical school student and I know the difference between correlation and causation, but want to learn about confounders.",
    "I work in economics and want to understand how to identify causal relationships in policy analysis.",
    "I'm a law student interested in how causality works in legal reasoning and liability cases."
]

def welcome_and_profile_user():
    """Welcome the user and profile them using the welcome agent."""

    display_welcome(WELCOME_MESSAGE, starter_examples=STARTER_EXAMPLES)

    try:
        user_response = console.input("\n[bold blue]Tell me about yourself:[/bold blue] ").strip()

        if user_response.lower() in ["/exit", "/quit"]:
            return False

        # Check if user selected an example by number
        try:
            i_example = int(user_response) - 1
            if 0 <= i_example < len(STARTER_EXAMPLES):
                user_response = STARTER_EXAMPLES[i_example]
        except ValueError:
            pass

        console.print("\n" + "─" * 80)
        console.print("\n[bold magenta]🔄 Processing your profile...[/bold magenta]")

        # Use the welcome agent to process the response
        agent_output = welcome_agent.run(WelcomeAgentInputSchema(user_response=user_response))

        # Display personalized welcome
        welcome_panel = Panel(
            Markdown(agent_output.personalized_welcome),
            title="[bold]🤗 Welcome[/bold]",
            border_style="green",
            padding=(1, 2),
        )
        console.print("\n")
        console.print(welcome_panel)

        
        # Create user profile dictionary
        user_profile = {
            "background": agent_output.background,
            "learning_goals": agent_output.learning_goals,
            "experience_level": agent_output.experience_level
        }

        # Update shared memory with user profile
        shared_memory.update_user_profile(user_profile)
        shared_memory.add_conversation_entry("system", user_response, agent_output.personalized_welcome)

        console.print("\n[bold green]✨ Great! Let's start your causality learning journey![/bold green]")
        return user_profile
        
    except Exception as e:
        console.print(f"\n[bold red]Error:[/bold red] {str(e)}")
        console.print("[dim]Please try again or type 'exit' to quit.[/dim]")



def learning_loop(vector_db: BaseVectorDBService, rag_context: RAGContextProvider) -> None:
    """Main learning loop with concept explanation and Socratic dialogue."""
    user_profile = shared_memory.get_user_profile()
    
    while True:
        try:
            # Get the topic user wants to learn
            if not shared_memory.get_current_topic():
                topic = console.input("\n[bold blue]What causality concept would you like to explore?[/bold blue] ").strip()
                if topic.lower() in ["/exit", "/quit"]:
                    break
                shared_memory.set_current_topic(topic)
            else:
                topic = shared_memory.get_current_topic()
            
            console.print("\n" + "─" * 80)
            console.print("\n[bold magenta]🔄 Phase 1: Retrieving and explaining the concept...[/bold magenta]")
            
            with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), console=console) as progress:
                # Phase 1: Query agent provides tailored explanation
                task = progress.add_task("[cyan]Generating semantic search and explanation...", total=None)
                query_output = query_agent.run(RAGQueryAgentInputSchema(
                    concept=topic,
                    user_profile=user_profile
                ))
                progress.remove_task(task)
                
                # Perform vector search
                task = progress.add_task("[cyan]Searching knowledge base...", total=None)
                search_results = vector_db.query(query_text=query_output.query, n_results=int(os.getenv("NUM_CHUNKS_TO_RETRIEVE", 5)))
                
                # Update context with retrieved chunks
                rag_context.chunks = [
                    ChunkItem(content=doc, metadata={"chunk_id": id, "distance": dist})
                    for doc, id, dist in zip(search_results["documents"], search_results["ids"], search_results["distance"])
                ]
                progress.remove_task(task)
            
            # Display the tailored explanation
            display_tailored_explanation(query_output)
            shared_memory.add_conversation_entry("query_agent", topic, query_output.tailored_explanation)
            
            # Phase 2: Start Socratic dialogue
            console.print("\n[bold magenta]🔄 Phase 2: Socratic dialogue session...[/bold magenta]")
            shared_memory.start_qa_session(query_output.concept_category)
            
            # Socratic dialogue loop
            while True:
                try:
                    qa_session = shared_memory.get_qa_session()
                    conversation_history = [item["response"] for item in qa_session.get("student_responses", [])]
                    
                    # Get QA agent response
                    qa_output = qa_agent.run(RAGQuestionAnsweringAgentInputSchema(
                        question=topic if qa_session["question_count"] == 0 else "Continue dialogue",
                        user_profile=user_profile,
                        concept_explanation=query_output.tailored_explanation,
                        conversation_history=conversation_history
                    ))
                    
                    # Display Socratic response
                    display_socratic_response(qa_output)
                    
                    if not qa_output.continue_dialogue:
                        # Session complete - display summary
                        display_session_summary(qa_output)
                        shared_memory.end_qa_session(qa_output.understanding_assessment, qa_output.session_summary)
                        break
                    
                    # Get student response
                    student_response = console.input("\n[bold blue]Your response:[/bold blue] ").strip()
                    
                    if student_response.lower() in ["/exit", "/quit"]:
                        return
                    
                    # Record the Q&A interaction
                    shared_memory.add_qa_interaction(qa_output.socratic_response, student_response)
                    shared_memory.add_conversation_entry("qa_agent", student_response, qa_output.socratic_response)
                    
                except Exception as e:
                    console.print(f"\n[bold red]Error in dialogue:[/bold red] {str(e)}")
                    break
            
            # Ask if user wants to learn another concept
            console.print("\n" + "─" * 80)
            continue_learning = console.input("\n[bold green]Would you like to explore another causality concept? (y/n):[/bold green] ").strip().lower()
            
            if continue_learning not in ['y', 'yes']:
                break
            else:
                shared_memory.set_current_topic("")  # Reset topic for next round
                
        except Exception as e:
            console.print(f"\n[bold red]Error:[/bold red] {str(e)}")
            console.print("[dim]Please try again or type 'exit' to quit.[/dim]")


def main_workflow(vector_db: BaseVectorDBService, rag_context: RAGContextProvider) -> None:
    """Main workflow following the planned architecture."""
    # Phase 0: Welcome and profile user
    user_profile = welcome_and_profile_user()
    if not user_profile:
        return

    # Phase 1 & 2: Learning loop with concept explanation and Socratic dialogue
    learning_loop(vector_db, rag_context)

    from educagent.utils import console
    console.print("\n[bold]🎓 Thank you for using EducAgent! Your learning progress has been saved.[/bold]")
            
            
if __name__ == "__main__":
    try:
        vector_db, rag_context = initialise_system()
        main_workflow(vector_db, rag_context)
    except KeyboardInterrupt:
        console.print("\n[bold]👋 Goodbye! Thanks for using EducAgent.[/bold]")
    except Exception as e:
        console.print(f"\n[bold red]Fatal error:[/bold red] {str(e)}")