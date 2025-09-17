from abc import ABC, abstractmethod
from typing import Dict, List, Optional, TypedDict


class QueryResult(TypedDict):
    """A single result from a vector database query."""
    documents: List[str]
    metadatas: Optional[Dict[str, str]]
    distance: List[float]
    ids: List[str]
    
    
class BaseVectorDBService(ABC):
    """Abstract base class for vector database services."""
    
    @abstractmethod
    def add_documents(
        self,
        documents: List[str],
        metadatas: Optional[List[Dict[str, str]]] = None,
        ids: Optional[List[str]] = None) -> List[str]:
        
        """
        Add documents to the vector database.
        
        Args:
            documents: List of document texts to add.
            metadatas: Optional list of metadata dictionaries for each document.
            ids: Optional list of unique IDs for each document. If not provided, UUIDs will be auto-generated.
        
        Returns:
            List[str]: List of IDs of the added documents.
        """
        pass
    
    @abstractmethod
    def query(
        self,
        query_text: str,
        n_results: int=5,
        where: Optional[Dict[str, str]]=None) -> QueryResult:
        """
        Query the vector database and return the top_k most similar documents.
        
        Args:
            query_text: The text to query.
            n_results: The number of top similar documents to return.
            where: Optional filter criteria.
        
        Returns:
            QueryResult: A dictionary containing documents, metadata, distances and IDs.
        
        """
        pass

    
    @abstractmethod
    def delete_collection(self, collection_name: Optional[str]=None) -> None:
        """
        Delete the collection by name.
        
        Args:
            collection_name: Optional name of the collection to delete. If None, deletes the current collection.
        
        Returns:
            None
        """
        pass
    
    
    @abstractmethod
    def delete_by_ids(self, ids: List[str]) -> None:
        """
        Delete documents from the vector database by their IDs.
        
        Args:
            ids: List of document IDs to delete.
        
        Returns:
            None
        """
        pass