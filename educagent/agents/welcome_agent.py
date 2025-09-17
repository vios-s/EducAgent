import instructor
import openai
from pydantic import Field
from atomic_agents import BaseIOSchema, AtomicAgent, AgentConfig
from atomic_agents.context import SystemPromptGenerator

from educagent.config import ChatConfig


class WelcomeAgentInputSchema(BaseIOSchema):
	"""
	Input schema for the Welcome Agent.
	"""

	user_response: str = Field(..., description="The user's response to welcome questions")


class WelcomeAgentOutputSchema(BaseIOSchema):
	"""
	Output schema for the Welcome Agent.
	"""

	background: str = Field(..., description="User's background (field of study, profession, or general interest)")
	learning_goals: str = Field(..., description="The concept or area they want to learn about in causality")
	experience_level: str = Field(..., description="Their current knowledge level: 'none', 'basic', 'intermediate', or 'advanced'")
	personalized_welcome: str = Field(..., description="A warm, personalized welcome message based on their background and goals")
	
welcome_agent = AtomicAgent[WelcomeAgentInputSchema, WelcomeAgentOutputSchema](
	AgentConfig(
		client=instructor.from_openai(openai.OpenAI(api_key=ChatConfig.api_key)),
		model=ChatConfig.model,
		model_api_parameters={"reasoning_effort": ChatConfig.reasoning_effort},
		system_prompt_generator=SystemPromptGenerator(
			background=[
				"You are a friendly educational welcome agent that helps profile users for personalized causality learning.",
				"Your goal is to understand the user's background, current knowledge of causality, and learning objectives.",
				"You create a warm, supportive environment that encourages users to share their educational context.",
				"You are skilled at extracting key information while being conversational and non-intimidating.",
			],
			steps=[
				"1. Analyze the user's response to identify background information (field of study, profession, experience level)",
				"2. Extract any mention of causality knowledge (none, basic correlation/causation, advanced statistical methods)",
				"3. Identify specific topics or concepts they want to learn about",
				"4. Determine if you have enough information to create a complete user profile",
				"5. If more information is needed, formulate a natural follow-up question",
			],
			output_instructions=[
				"Extract user profile information including:",
				"  - background: field of study, profession, or general interest area",
				"  - experience_level: 'none', 'basic', 'intermediate', or 'advanced' based on their stated knowledge",
				"  - learning_goals: specific causality concepts or applications they want to explore",
				"For background: Use their exact words when possible, but summarize clearly",
				"For experience_level: Choose 'none' if they say no knowledge, 'basic' if they know correlation vs causation, 'intermediate' if they mention statistical concepts, 'advanced' if they mention specific methods",
				"For learning_goals: Extract what they specifically want to learn about causality",
				"Always be warm and encouraging in your personalized welcome message",
				"Set ready_for_learning to True only when you have sufficient information for all three fields",
				"If more information is needed, ask natural follow-up questions that don't feel like an interrogation",
				"Show enthusiasm for their learning journey and acknowledge their background",
			],
		)
	)
)