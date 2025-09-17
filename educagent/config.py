import os
from dataclasses import dataclass
from enum import Enum

from dotenv import load_dotenv

load_dotenv()


class VectorDBType(str, Enum):
    CHROMA_DB = "chroma_db"
    
def get_api_key() -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set")
    return api_key


def get_vector_db_type() -> VectorDBType:
    db_type = os.getenv("VECTOR_DB_TYPE", "chroma_db").lower()
    if db_type not in VectorDBType._value2member_map_:
        raise ValueError(f"Unsupported VECTOR_DB_TYPE: {db_type}")
    return VectorDBType(db_type)


@dataclass
class ChatConfig:
    """
    Configuration for the chat application
    """
    
    api_key: str = get_api_key()
    model: str = os.getenv("OPENAI_MODEL", "gpt-5-nano")
    reasoning_effort: str = "low"  # Options: "low", "medium", "high"
    exit_commands: set[str] = frozenset({"/exit", "/quit",})
    
    def __init__(self):
        raise TypeError("ChatConfig is not meant to be instantiated")
    
    
# Vector Database Configuration
VECTOR_DB_TYPE = get_vector_db_type()

# ChromaDB Configuration
CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
DOCUMENT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "resources")