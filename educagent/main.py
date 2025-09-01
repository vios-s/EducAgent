import os
from typing import List
import wget
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich import box

from educagent.agents.query_agent import query_agent, RAGQueryAgentInputSchema, RAGQueryAgentOutputSchema
from educagent.agents.socratic_agent import qa_agent, RAGQuestionAnsweringAgentInputSchema, RAGQuestionAnsweringAgentOutputSchema
from educagent.context_providers import RAGContextProvider, ChunkItem
from educagent.services.factory import create_vector_db_service
from educagent.services.base import BaseVectorDBService
from educagent.config import VECTOR_DB_TYPE, DOCUMENT_DIR

load_dotenv()

console = Console()


WELCOME_MESSAGE = """
Welcome to the EducAgent! I can help you learn causality.
Ask me any questions about causality and I'll use my knowledge base to provide accurate answers.

I'll show you my thought process:
1. First, I'll ask you about your profile and background.
2. Then, I'll start from a concept that fit for your current level retrieve relevant chunks of text from the speech.
3. Finally, I'll analyze these chunks to provide you with an answer

Using vector database: {db_type}
"""

STARTER_EXAMPLES = [
    "I am a computer science student with no knowledge of causality.",
    "I have a background in psychology and want to learn about causal inference.",
    "I am a medical school student and I know the correlation and causation."
]

def chunk_document(file_path: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """ Split PDF document into chunks with overlap for ChromaDB storage."""
    import PyPDF2
    import re
    from pathlib import Path
    
    # Get chunk parameters from environment or use defaults
    chunk_size = int(os.getenv("CHUNK_SIZE", chunk_size))
    overlap = int(os.getenv("CHUNK_OVERLAP", overlap))
    
    chunks = []
    
    # Handle single file or directory
    if os.path.isfile(file_path):
        pdf_files = [file_path]
    elif os.path.isdir(file_path):
        pdf_files = list(Path(file_path).glob("*.pdf"))
    else:
        raise ValueError(f"Path {file_path} is neither a file nor directory")
    
    for pdf_file in pdf_files:
        try:
            # Extract text from PDF
            with open(pdf_file, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text.strip():  # Only add non-empty pages
                        text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
            
            if not text.strip():
                console.print(f"[yellow]Warning: No text extracted from {pdf_file}[/yellow]")
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
            console.print(f"[red]Error processing {pdf_file}: {str(e)}[/red]")
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
    
    
# 
def display_answer(qa_output: RAGQuestionAnsweringAgentOutputSchema) -> None:
    """Display the reasoning and Socratic response from the teaching agent."""
    # Display reasoning
    reasoning_panel = Panel(
        Markdown(qa_output.reasoning),
        title="[bold]🤔 Teaching Analysis[/bold]",
        border_style="green",
        padding=(1, 2),
    )
    console.print("\n")
    console.print(reasoning_panel)

    # Display concept focus
    concept_panel = Panel(
        f"[yellow]Focus:[/yellow] {qa_output.concept_focus}",
        title="[bold]🎯 Causality Concept[/bold]",
        border_style="yellow",
        padding=(1, 2),
    )
    console.print("\n")
    console.print(concept_panel)

    # Display Socratic response
    socratic_panel = Panel(
        Markdown(qa_output.socratic_response),
        title="[bold]💡 Socratic Tutor[/bold]",
        border_style="blue",
        padding=(1, 2),
    )
    console.print("\n")
    console.print(socratic_panel)
    


def chat_loop(vector_db: BaseVectorDBService, rag_context: RAGContextProvider) -> None:
    """Main chat loop."""
    display_welcome()

    while True:
        try:
            user_message = console.input("\n[bold blue]Your question:[/bold blue] ").strip()

            if user_message.lower() in ["/exit", "/quit"]:
                console.print("\n[bold]👋 Goodbye! Thanks for using the RAG Chatbot.[/bold]")
                break

            try:
                i_question = int(user_message) - 1
                if 0 <= i_question < len(STARTER_EXAMPLES):
                    user_message = STARTER_EXAMPLES[i_question]
            except ValueError:
                pass

            console.print("\n" + "─" * 80)
            console.print("\n[bold magenta]🔄 Processing your question...[/bold magenta]")

            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console,
            ) as progress:
                # Generate search query
                task = progress.add_task("[cyan]Generating semantic search query...", total=None)
                query_output = query_agent.run(RAGQueryAgentInputSchema(concept=user_message))
                progress.remove_task(task)

                # Display query information
                display_query_info(query_output)

                # Perform vector search
                task = progress.add_task("[cyan]Searching knowledge base...", total=None)
                search_results = vector_db.query(query_text=query_output.query, n_results=int(os.getenv("NUM_CHUNKS_TO_RETRIEVE", 5)))

                # Update context with retrieved chunks
                rag_context.chunks = [
                    ChunkItem(content=doc, metadata={"chunk_id": id, "distance": dist})
                    for doc, id, dist in zip(search_results["documents"], search_results["ids"], search_results["distance"])
                ]
                progress.remove_task(task)

                # Display retrieved chunks
                display_chunks(rag_context.chunks)

                # Generate answer
                task = progress.add_task("[cyan]Analyzing chunks and generating answer...", total=None)
                qa_output = qa_agent.run(RAGQuestionAnsweringAgentInputSchema(question=user_message))
                progress.remove_task(task)

                # Display answer
                display_answer(qa_output)

            console.print("\n" + "─" * 80)

        except Exception as e:
            console.print(f"\n[bold red]Error:[/bold red] {str(e)}")
            console.print("[dim]Please try again or type 'exit' to quit.[/dim]")
            
            
if __name__ == "__main__":
    try:
        vector_db, rag_context = initialise_system()
        chat_loop(vector_db, rag_context)
    except KeyboardInterrupt:
        console.print("\n[bold]👋 Goodbye! Thanks for using the RAG Chatbot.[/bold]")
    except Exception as e:
        console.print(f"\n[bold red]Fatal error:[/bold red] {str(e)}")