from .base import BaseVectorDBService
from .chroma_db import ChromaDBService
from ..config import VECTOR_DB_TYPE, CHROMA_PERSIST_DIR


def create_vector_db_service(
    collection_name: str,
    recreate_collection: bool = False
) -> BaseVectorDBService:
    """
    Create a vector database service based on configuration.

    Args:
        collection_name (str): Name of the collection to use.
        recreate_collection (bool, optional): If true deletes the collection if it exists before creating. Defaults to False.

    Returns:
        BaseVectorDBService: The appropriate vector database vservice instance
    """
    
    if VECTOR_DB_TYPE == "chroma_db":
        return ChromaDBService(
            collection_name=collection_name,
            persist_directory=CHROMA_PERSIST_DIR,
            recreate_collection=recreate_collection
        )
    else:
        raise ValueError(f"Unsupported VECTOR_DB_TYPE: {VECTOR_DB_TYPE}")