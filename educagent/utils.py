import os
from typing import List

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

console = Console()

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
def display_welcome(welcome_message: str, starter_examples: List[str]) -> None:
    """Display welcome message and starter questions."""
    welcome_panel = Panel(
        welcome_message.format(db_type=VECTOR_DB_TYPE.value.upper()),
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

    for i, question in enumerate(starter_examples, 1):
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