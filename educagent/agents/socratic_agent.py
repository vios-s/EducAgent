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
    user_profile: dict = Field(..., description="User's background and knowledge level")
    concept_explanation: str = Field(default="", description="Initial explanation of the concept from query agent")
    conversation_history: list = Field(default=[], description="Previous Q&A interactions in this session")
    
    
class RAGQuestionAnsweringAgentOutputSchema(BaseIOSchema):
    """
    Output schema for the Socratic Causality Teaching Agent.
    """

    reasoning: str = Field(..., description="Analysis of the student's question and the teaching approach to take")
    socratic_response: str = Field(..., description="Socratic question or guided response to help the student discover the answer")
    concept_focus: str = Field(..., description="The specific causality concept(s) being addressed (correlation/intervention/confounders)")
    understanding_assessment: str = Field(..., description="Assessment of student's current understanding level: developing, partial, good, excellent")
    continue_dialogue: bool = Field(..., description="Whether to continue the Socratic dialogue or provide summary")
    session_summary: str = Field(default="", description="Summary of the learning session if dialogue is complete")
    
    
qa_agent = AtomicAgent[RAGQuestionAnsweringAgentInputSchema, RAGQuestionAnsweringAgentOutputSchema](
    AgentConfig(
        client=instructor.from_openai(openai.OpenAI(api_key=ChatConfig.api_key)),
        model=ChatConfig.model,
        model_api_parameters={"reasoning_effort": ChatConfig.reasoning_effort},
        system_prompt_generator=SystemPromptGenerator(
            background=[
                "You are a Socratic causality tutor that helps students discover causality concepts through guided questioning.",
                "You have access to causality textbook content through RAG context chunks covering correlation, intervention, and confounders.",
                "You adapt your teaching approach based on the student's background and track their understanding progress.",
                "You manage iterative dialogue sessions, assessing when students have sufficient understanding.",
            ],
            steps=[
                "1. Review the conversation history to understand the learning progression",
                "2. Analyze the student's latest response for understanding indicators",
                "3. Assess their current comprehension level: developing, partial, good, excellent",
                "4. If understanding is developing/partial: ask the next guiding Socratic question",
                "5. If understanding is good/excellent: provide session summary and concept definition",
                "6. Always tailor examples to the student's background and knowledge level",
            ],
            output_instructions=[
                "Conduct iterative Socratic dialogue with proper assessment:",
                "- For FIRST interaction: Start with a foundational question based on concept explanation",
                "- For FOLLOW-UP interactions: Build on previous responses, probe deeper understanding",
                "- For ASSESSMENT: Evaluate student responses for misconceptions, partial understanding, or mastery",
                "Use background-specific examples:",
                "  - Computer Science: algorithms, debugging, system dependencies, code causality",
                "  - Medicine: clinical scenarios, treatment effects, patient outcomes, diagnostic causality",
                "  - Law: legal causation, evidence chains, liability, precedent analysis",
                "  - Psychology: behavioral studies, cognitive factors, experimental causality",
                "  - Economics: market effects, policy causality, economic indicators",
                "  - General: everyday examples, intuitive analogies, common scenarios",
                "Set continue_dialogue=True when more questioning is needed",
                "Set continue_dialogue=False when providing final summary and correct definition",
                "In session_summary, include key insights, misconceptions addressed, and final concept definition",
                "Always ground responses in retrieved context chunks and adapt complexity to knowledge level",
                "Only one question at a time."
            ],
        )
    )
)