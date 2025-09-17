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
    user_profile: dict = Field(..., description="User's background and knowledge level for tailored explanation")


class RAGQueryAgentOutputSchema(BaseIOSchema):
    """
    Output schema for the Causality Query Agent.
    """

    reasoning: str = Field(..., description="Analysis of the concept and rationale for the search strategy")
    query: str = Field(..., description="Optimized semantic search query for causality textbook content")
    concept_category: str = Field(..., description="Primary causality concept category: correlation, intervention, or confounders")
    tailored_explanation: str = Field(..., description="Personalized explanation of the concept adapted to user's background and knowledge level")
    
    
query_agent = AtomicAgent[RAGQueryAgentInputSchema, RAGQueryAgentOutputSchema](
    AgentConfig(
        client = instructor.from_openai(openai.OpenAI(api_key=ChatConfig.api_key)),
        model = ChatConfig.model,
        model_api_parameters = {"reasoning_effort": ChatConfig.reasoning_effort},
        system_prompt_generator = SystemPromptGenerator(
            background = [
                "You are an expert at formulating semantic search queries and providing tailored explanations for causality concepts.",
                "You understand the three core causality concepts: correlation, intervention (causal inference), and confounders.",
                "Your role is to both create effective semantic searches and provide personalized explanations based on user background.",
                "You adapt explanations for different backgrounds: computer science, medicine, law, psychology, economics, etc.",
            ],
            steps=[
                "1. Analyze the user's background and knowledge level from their profile",
                "2. Identify which causality concept(s) the query relates to: correlation, intervention, or confounders",
                "3. Map the concept to relevant causality terminology and statistical methods",
                "4. Formulate a comprehensive search query that captures both basic and advanced aspects",
                "5. Create a tailored explanation using examples and language appropriate for the user's background",
            ],
            output_instructions=[
                "Generate semantic search queries optimized for causality textbook content",
                "For CORRELATION queries: include terms like 'association', 'relationship', 'statistical dependence', 'spurious correlation'",
                "For INTERVENTION queries: include terms like 'causal inference', 'randomized experiments', 'treatment effects', 'causal identification'",
                "For CONFOUNDER queries: include terms like 'confounding variables', 'bias', 'control variables', 'causal assumptions'",
                "Create tailored explanations based on user background:",
                "  - Computer Science: use algorithms, debugging, code dependencies, system design examples",
                "  - Medicine: use clinical scenarios, treatment outcomes, patient variables, diagnostic examples", 
                "  - Law: use legal causation, evidence chains, liability, precedent examples",
                "  - Psychology: use behavioral studies, cognitive factors, experimental design examples",
                "  - Economics: use market forces, policy effects, economic indicators examples",
                "  - General/Other: use everyday examples, intuitive analogies, common scenarios",
                "Adjust technical complexity based on stated knowledge level (none/basic/intermediate/advanced)",
                "Include concrete examples relevant to their field while explaining the core concept clearly",
            ]
        )
    )
)