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
from educagent.services.memory import shared_memory
from educagent.context_providers import RAGContextProvider, ChunkItem
from educagent.services.factory import create_vector_db_service
from educagent.services.base import BaseVectorDBService
from educagent.config import VECTOR_DB_TYPE, DOCUMENT_DIR

load_dotenv()

console = Console()


WELCOME_MESSAGE = """
🎓 Welcome to EducAgent - Your Personal Causality Tutor! 🎓

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

def chunk_document(file_path: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """ Split PDF and text documents into chunks with overlap for ChromaDB storage."""
    import pypdf
    import re
    from pathlib import Path
    
    # Get chunk parameters from environment or use defaults
    chunk_size = int(os.getenv("CHUNK_SIZE", chunk_size))
    overlap = int(os.getenv("CHUNK_OVERLAP", overlap))
    
    chunks = []
    
    # Handle single file or directory
    if os.path.isfile(file_path):
        files = [file_path]
    elif os.path.isdir(file_path):
        # Support both PDF and text files
        path_obj = Path(file_path)
        files = list(path_obj.glob("*.pdf")) + list(path_obj.glob("*.txt"))
    else:
        raise ValueError(f"Path {file_path} is neither a file nor directory")
    
    for file in files:
        try:
            text = ""
            
            if str(file).endswith('.pdf'):
                # Extract text from PDF
                with open(file, 'rb') as f:
                    pdf_reader = pypdf.PdfReader(f)
                    
                    for page_num, page in enumerate(pdf_reader.pages):
                        page_text = page.extract_text()
                        if page_text.strip():  # Only add non-empty pages
                            text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
            
            elif str(file).endswith('.txt'):
                # Extract text from text file
                with open(file, 'r', encoding='utf-8') as f:
                    text = f.read()
            
            if not text.strip():
                console.print(f"[yellow]Warning: No text extracted from {file}[/yellow]")
                continue
            
            # Clean and normalize text
            text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
            text = re.sub(r'\n+', '\n', text)  # Normalize newlines
            
            # Split into sentences for better chunking boundaries
            sentences = re.split(r'(?<=[.!?])\s+', text)
            
            current_chunk = ""
            current_size = 0
            
            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence:
                    continue
                    
                # Check if adding this sentence exceeds chunk size
                if current_size + len(sentence) > chunk_size and current_chunk:
                    # Save current chunk
                    chunks.append(current_chunk.strip())
                    
                    # Start new chunk with overlap from previous chunk
                    if overlap > 0 and chunks:
                        # Get last N words for overlap
                        words = current_chunk.split()
                        overlap_words = words[-overlap:] if len(words) >= overlap else words
                        current_chunk = " ".join(overlap_words) + " " + sentence
                        current_size = len(current_chunk)
                    else:
                        current_chunk = sentence
                        current_size = len(sentence)
                else:
                    # Add sentence to current chunk
                    if current_chunk:
                        current_chunk += " " + sentence
                        current_size += len(sentence) + 1
                    else:
                        current_chunk = sentence
                        current_size = len(sentence)
            
            # Don't forget the last chunk
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
                
        except Exception as e:
            console.print(f"[red]Error processing {file}: {str(e)}[/red]")
            continue
    
    # Filter out very short chunks (likely noise)
    chunks = [chunk for chunk in chunks if len(chunk.split()) >= 10]
    
    return chunks
    
    
def initialise_system() -> tuple[BaseVectorDBService, RAGContextProvider]:
    """Initialise the RAG system components."""
    console.print("\n [bold magenta]🚀 Initialising RAG system...[/bold magenta]")
    
    try:
        # Process PDF documents and create chunks
        doc_path = DOCUMENT_DIR
        chunks = chunk_document(doc_path, chunk_size=1000, overlap=200)
        console.print(f"[dim]• Created {len(chunks)} document chunks[/dim]")
        
        # Initialise vector database
        console.print(f"[dim]• Initializing {VECTOR_DB_TYPE.value} vector database...[/dim]")
        vector_db = create_vector_db_service(collection_name="causality_textbook", recreate_collection=False)
        
        # Add chunks to vector database
        console.print("[dim]• Adding document chunks to vector database...[/dim]")
        chunk_ids = vector_db.add_documents(documents=chunks, metadatas=[{"source": "causality_textbook", "chunk_index": i} for i in range(len(chunks))])
        console.print(f"[dim]• Added {len(chunk_ids)} chunks to vector database[/dim]")
        
        # Initialize context provider
        console.print("[dim]• Creating context provider...[/dim]")
        rag_context = RAGContextProvider("RAG Context")

        # Register context provider with agents
        console.print("[dim]• Registering context provider with agents...[/dim]")
        query_agent.register_context_provider("rag_context", rag_context)
        qa_agent.register_context_provider("rag_context", rag_context)
        
        # Clear any previous session memory
        shared_memory.clear_memory()
        
        console.print("[bold green]✨ System initialized successfully![/bold green]\n")
        return vector_db, rag_context
    
    except Exception as e:
        console.print(f"\n[bold red]Error during initialization:[/bold red] {str(e)}")
        raise
    
    
# Display helper functions
def display_welcome() -> None:
    """Display welcome message and starter questions."""
    welcome_panel = Panel(
        WELCOME_MESSAGE.format(db_type=VECTOR_DB_TYPE.value.upper()),
        title="[bold blue]EducAgent[/bold blue]",
        border_style="blue",
        padding=(1, 2),
    )
    console.print("\n")
    console.print(welcome_panel)
    
    table = Table(
        show_header=True, header_style="bold cyan", box=box.ROUNDED, title="[bold]Examples to Get Started[/bold]"
    )
    table.add_column("№", style="dim", width=4)
    table.add_column("Question", style="green")

    for i, question in enumerate(STARTER_EXAMPLES, 1):
        table.add_row(str(i), question)

    console.print("\n")
    console.print(table)
    console.print("\n" + "─" * 80 + "\n")
    
# For Debug use
def display_chunks(chunks: List[ChunkItem])->None:
    """Display the retrieved chunks in a formatted way."""
    console.print("\n[bold cyan]📚 Retrieved Text Chunks:[/bold cyan]")

    for i, chunk in enumerate(chunks, 1):
        chunk_panel = Panel(
            Markdown(chunk.content),
            title=f"[bold]Chunk {i} (Distance: {chunk.metadata['distance']:.4f})[/bold]",
            border_style="blue",
            padding=(1, 2),
        )
        console.print(chunk_panel)
        console.print()
        
# For Debug use  
def display_query_info(query_output: RAGQueryAgentOutputSchema)-> None:
    """Display information about the generated query."""
    query_panel = Panel(
        f"[yellow]Generated Query:[/yellow] {query_output.query}\n\n" f"[yellow]Reasoning:[/yellow] {query_output.reasoning}",
        title="[bold]🔍 Semantic Search Strategy[/bold]",
        border_style="yellow",
        padding=(1, 2),
    )
    console.print("\n")
    console.print(query_panel)

def display_tailored_explanation(query_output: RAGQueryAgentOutputSchema) -> None:
    """Display the tailored explanation from query agent."""
    explanation_panel = Panel(
        Markdown(query_output.tailored_explanation),
        title="[bold]📖 Concept Explanation[/bold]",
        border_style="green",
        padding=(1, 2),
    )
    console.print("\n")
    console.print(explanation_panel)
    
# 
def display_socratic_response(qa_output: RAGQuestionAnsweringAgentOutputSchema) -> None:
    """Display the Socratic response from the teaching agent."""
    # Display Socratic response
    socratic_panel = Panel(
        Markdown(qa_output.socratic_response),
        title="[bold]💡 Socratic Tutor[/bold]",
        border_style="blue",
        padding=(1, 2),
    )
    console.print("\n")
    console.print(socratic_panel)
    
    # Display understanding assessment
    assessment_color = {
        "developing": "red",
        "partial": "yellow", 
        "good": "green",
        "excellent": "bright_green"
    }.get(qa_output.understanding_assessment, "white")
    
    assessment_panel = Panel(
        f"[{assessment_color}]Understanding Level: {qa_output.understanding_assessment.title()}[/{assessment_color}]",
        title="[bold]📊 Learning Assessment[/bold]",
        border_style=assessment_color,
        padding=(1, 2),
    )
    console.print("\n")
    console.print(assessment_panel)

def display_session_summary(qa_output: RAGQuestionAnsweringAgentOutputSchema) -> None:
    """Display the final session summary."""
    if qa_output.session_summary:
        summary_panel = Panel(
            Markdown(qa_output.session_summary),
            title="[bold]🎓 Learning Session Summary[/bold]",
            border_style="bright_green",
            padding=(1, 2),
        )
        console.print("\n")
        console.print(summary_panel)
    


def welcome_and_profile_user() -> bool:
    """Welcome user and collect their profile. Returns True if profiling is complete."""
    display_welcome()

    while True:
        try:
            user_response = console.input("\n[bold blue]Tell me about yourself:[/bold blue] ").strip()

            if user_response.lower() in ["/exit", "/quit"]:
                return False

            # Check if user selected an example
            try:
                i_example = int(user_response) - 1
                if 0 <= i_example < len(STARTER_EXAMPLES):
                    user_response = STARTER_EXAMPLES[i_example]
            except ValueError:
                pass

            console.print("\n" + "─" * 80)
            console.print("\n[bold magenta]🔄 Processing your profile...[/bold magenta]")

            # Create a simple user profile from the response
            user_profile = {
                "background": user_response,
                "learning_goals": "Learn causality concepts",
                "experience_level": "beginner"  # Default assumption
            }

            # Display personalized welcome
            welcome_message = f"Welcome! I understand you'd like to learn about causality. Based on your background: '{user_response}', I'll tailor the explanations to your level and interests."
            welcome_panel = Panel(
                Markdown(welcome_message),
                title="[bold]🤗 Personalized Welcome[/bold]",
                border_style="green",
                padding=(1, 2),
            )
            console.print("\n")
            console.print(welcome_panel)

            # Update shared memory with user profile
            shared_memory.update_user_profile(user_profile)
            shared_memory.add_conversation_entry("system", user_response, welcome_message)

            console.print("\n[bold green]✨ Great! Let's start your causality learning journey![/bold green]")
            return True

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
    if not welcome_and_profile_user():
        return
    
    # Phase 1 & 2: Learning loop with concept explanation and Socratic dialogue
    learning_loop(vector_db, rag_context)
    
    console.print("\n[bold]🎓 Thank you for using EducAgent! Your learning progress has been saved.[/bold]")
            
            
if __name__ == "__main__":
    try:
        vector_db, rag_context = initialise_system()
        main_workflow(vector_db, rag_context)
    except KeyboardInterrupt:
        console.print("\n[bold]👋 Goodbye! Thanks for using EducAgent.[/bold]")
    except Exception as e:
        console.print(f"\n[bold red]Fatal error:[/bold red] {str(e)}")