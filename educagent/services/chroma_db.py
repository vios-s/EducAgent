import os
import shutil
import uuid
from typing import Dict, List, Optional
from dotenv import load_dotenv

import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction

from .base import BaseVectorDBService, QueryResult

# Load environment variables from .env file
load_dotenv()


class ChromaDBService(BaseVectorDBService):
    """
    Service for interacting with ChromaDB using OpenAI embeddings.
    """
    
    def __init__(
        self,
        collection_name: str,
        persist_directory: str="./chroma_db",
        recreate_collection: bool=False
    ) -> None:
        """
        
        Initialise ChromaDBService with OpenAI embeddings.

        Args:
            collection_name (str): Name of the collection to use
            persist_directory (str, optional): Directory to persist ChromaDB data. Defaults to "./chroma_db".
            recreate_collection (bool, optional): If True, deltes the collection if it exists before creating. Defaults to False.
        """
        
        # Initialise embedding function with OpenAI
        self.embedding_function = OpenAIEmbeddingFunction(
            api_key=os.getenv("OPENAI_API_KEY"),
            model_name=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
        )

        self.persist_directory = os.getenv("CHROMA_PERSIST_DIR", persist_directory)

        # If recreating, delete the entire persist directory
        if recreate_collection and os.path.exists(self.persist_directory):
            shutil.rmtree(self.persist_directory)
            os.makedirs(self.persist_directory)

        # Initialise ChromaDB client
        self.client = chromadb.PersistentClient(path=self.persist_directory)

        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.embedding_function,
            metadata={"hnsw:space": "cosine"} # Explicit set distance metric
        )
        
    
    def add_documents(
        self, 
        documents: List[str], 
        metadatas: Optional[List[Dict[str, str]]] = None, 
        ids: Optional[List[str]] = None
    ) -> List[str]:
        """
        Add documents to the ChromaDB collection.

        Args:
            documents (List[str]): List of text documents to add.
            metadatas (Optional[List[Dict[str, str]]], optional): Optional list of metadata dicts for each document. Defaults to None.
            ids (Optional[List[str]], optional): Optional list of IDs for each document, if not provided, UUIDs will be generated. Defaults to None.

        Returns:
            List[str]: The IDs of the added documents.
        """
        
        if ids is None:
            ids = [str(uuid.uuid4()) for _ in documents]
            
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        return ids
    

    def query(
        self,
        query_text: str,
        n_results: int = 5,
        where: Optional[Dict[str, str]] = None
    ) -> QueryResult:
        """
        Query the ChromaDB collection for similar documents.

        Args:
            query_text (str): Text to find similar documents for.
            n_results (int, optional): Number of results to return. Defaults to 5.
            where (Optional[Dict[str, str]], optional): Optional filter criteria. Defaults to None.

        Returns:
            QueryResult: The query results containing IDs, documents, and metadatas.
        """
        
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"]
        )
        
        if results['ids']:
            return QueryResult(
                ids=results['ids'][0],
                documents=results['documents'][0],
                metadatas=results['metadatas'][0],
                distance=results['distances'][0]
            )
        else:
            return QueryResult(ids=[], documents=[], metadatas=[], distance=[])
        
        
    def delete_collection(self, collection_name = None) -> None:
        """
        Deelte a collection by name.

        Args:
            collection_name (_type_, optional): Name of the collection to delete. Defaults to None.
        """
        
        name_to_delete = collection_name if collection_name else self.collection.name
        self.client.delete_collection(name=name_to_delete)
        
    
    def delete_by_ids(self, ids: List[str]) -> None:
        """
        Delete documents from the collection by their IDs.

        Args:
            ids (List[str]): List of document IDs to delete.
        """
        
        self.collection.delete(ids=ids)