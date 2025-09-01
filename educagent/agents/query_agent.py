import instructor
import openai
from pydantic import Field
from atomic_agents import BaseIOSchema, AtomicAgent, AgentConfig
from atomic_agents.context import SystemPromptGenerator

from educagent.config import ChatConfig


class RAGQueryAgentInputSchema(BaseIOSchema):
    """
    Input schema for the RAG Query Agent.
    """

    concept: str = Field(..., description="The concept being queried")


class RAGQueryAgentOutputSchema(BaseIOSchema):
    """
    Output schema for the Causality Query Agent.
    """

    reasoning: str = Field(..., description="Analysis of the concept and rationale for the search strategy")
    query: str = Field(..., description="Optimized semantic search query for causality textbook content")
    concept_category: str = Field(..., description="Primary causality concept category: correlation, intervention, or confounders")
    
    
query_agent = AtomicAgent[RAGQueryAgentInputSchema, RAGQueryAgentOutputSchema](
    AgentConfig(
        client = instructor.from_openai(openai.OpenAI(api_key=ChatConfig.api_key)),
        model = ChatConfig.model,
        model_api_parameters = {"reasoning_effort": ChatConfig.reasoning_effort},
        system_prompt_generator = SystemPromptGenerator(
            background = [
                "You are an expert at formulating semantic search queries specifically for causality textbook content.",
                "You understand the three core causality concepts: correlation, intervention (causal inference), and confounders.",
                "Your role is to convert causality concept queries into effective semantic searches that retrieve relevant textbook chapters.",
                "You are familiar with causality terminology, statistical concepts, and experimental design principles.",
            ],
            steps=[
                "1. Identify which causality concept(s) the query relates to: correlation, intervention, or confounders",
                "2. Map the concept to relevant causality terminology and statistical methods",
                "3. Consider related concepts, synonyms, and technical terms used in causality textbooks",
                "4. Formulate a comprehensive search query that captures both basic and advanced aspects",
                "5. Include alternative phrasings that textbook authors might use",
            ],
            output_instructions=[
                "Generate semantic search queries optimized for causality textbook content",
                "For CORRELATION queries: include terms like 'association', 'relationship', 'statistical dependence', 'spurious correlation'",
                "For INTERVENTION queries: include terms like 'causal inference', 'randomized experiments', 'treatment effects', 'causal identification'",
                "For CONFOUNDER queries: include terms like 'confounding variables', 'bias', 'control variables', 'causal assumptions'",
                "Include both formal statistical terminology and intuitive explanations",
                "Consider different educational contexts (introductory vs advanced)",
                "Add related methodological terms (e.g., 'regression', 'experimental design', 'observational studies')",
                "Explain how your query targets the specific causality concept and related textbook content",
            ]
        )
    )
)