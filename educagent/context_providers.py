from dataclasses import dataclass
from typing import List
from atomic_agents.context import BaseDynamicContextProvider

@dataclass
class ChunkItem:
    content: str
    metadata: dict
    

class RAGContextProvider(BaseDynamicContextProvider):
    def __init__(self, title:str):
        super().__init__(title=title)
        self.chunks: List[ChunkItem] = []
        
        
    def get_info(self) -> str:
        return "\n\n".join(
            [
                f"Chunk {idx}:\n Metadata: {item.metadata}\n Content: {item.content}\n{"-" * 80}"
                for idx, item in enumerate(self.chunks, 1)
            ]
        )