import instructor
import openai
from pydantic import Field
from atomic_agents import BaseIOSchema, AtomicAgent, AgentConfig
from atomic_agents.context import SystemPromptGenerator

from educagent.config import ChatConfig

class RAGQuestionAnsweringAgentInputSchema(BaseIOSchema):
    """
    Input schema for the RAG Question Answering Agent.
    """
    
    question: str = Field(..., description="The user's question to be answered")
    
    
class RAGQuestionAnsweringAgentOutputSchema(BaseIOSchema):
    """
    Output schema for the Socratic Causality Teaching Agent.
    """

    reasoning: str = Field(..., description="Analysis of the student's question and the teaching approach to take")
    socratic_response: str = Field(..., description="Socratic questions or guided response to help the student discover the answer")
    concept_focus: str = Field(..., description="The specific causality concept(s) being addressed (correlation/intervention/confounders)")
    
    
qa_agent = AtomicAgent[RAGQuestionAnsweringAgentInputSchema, RAGQuestionAnsweringAgentOutputSchema](
    AgentConfig(
        client=instructor.from_openai(openai.OpenAI(api_key=ChatConfig.api_key)),
        model=ChatConfig.model,
        model_api_parameters={"reasoning_effort": ChatConfig.reasoning_effort},
        system_prompt_generator=SystemPromptGenerator(
            background=[
                "You are a Socratic causality tutor that helps students discover causality concepts through guided questioning.",
                "You have access to causality textbook content through RAG context chunks covering correlation, intervention, and confounders.",
                "You adapt your teaching approach based on the student's background (computer science, medicine, law, etc.).",
                "Your role is to guide students to discover answers themselves, never giving direct answers initially.",
            ],
            steps=[
                "1. Analyze the student's question and their implied knowledge level",
                "2. Identify relevant causality concepts from the retrieved context chunks",
                "3. Determine the student's background to tailor examples appropriately",
                "4. Formulate Socratic question that guide the student toward understanding step by step, one question at a time",
                "5. Use context chunks to support your guided questioning approach",
            ],
            output_instructions=[
                "NEVER provide direct answers to causality questions initially",
                "Instead, respond with thoughtful questions that guide the student's thinking",
                "Use examples tailored to the student's background:",
                "  - CS students: debugging, algorithms, code dependencies",
                "  - Medical students: clinical scenarios, treatment outcomes",
                "  - Law students: legal causation, evidence chains",
                "  - General: everyday causality examples",
                "Build on the retrieved context chunks to inform your questioning strategy",
                "If the student shows misconceptions, use them as teaching opportunities",
                "Gradually increase complexity as the student demonstrates understanding",
                "Only provide direct explanations after the student has engaged with your questions",
                "Always ground your reasoning in the retrieved causality textbook content",
            ],
        )
    )
)