import json
import os
from typing import Dict, Any, List
from pathlib import Path
from datetime import datetime


class SharedMemory:
	"""
	Shared memory system for storing user profile and conversation context
	that persists across agent interactions and sessions.
	"""
	
	def __init__(self, memory_file: str = "user_session.json"):
		self.memory_file = Path(memory_file)
		self.data = self._load_memory()
	
	def _load_memory(self) -> Dict[str, Any]:
		"""Load memory from file or create new if doesn't exist."""
		if self.memory_file.exists():
			try:
				with open(self.memory_file, 'r') as f:
					return json.load(f)
			except (json.JSONDecodeError, IOError):
				return self._create_empty_memory()
		return self._create_empty_memory()
	
	def _create_empty_memory(self) -> Dict[str, Any]:
		"""Create empty memory structure."""
		return {
			"user_profile": {
				"background": "",
				"causality_knowledge": "",
				"specific_interests": [],
				"learning_goals": "",
				"session_start": datetime.now().isoformat()
			},
			"conversation_history": [],
			"current_topic": "",
			"learning_progress": {
				"concepts_covered": [],
				"questions_asked": [],
				"understanding_level": "beginner"
			},
			"qa_session": {
				"active": False,
				"concept_focus": "",
				"question_count": 0,
				"student_responses": [],
				"comprehension_assessment": ""
			}
		}
	
	def save_memory(self) -> None:
		"""Save current memory state to file."""
		try:
			with open(self.memory_file, 'w') as f:
				json.dump(self.data, f, indent=2, default=str)
		except IOError as e:
			print(f"Warning: Could not save memory to {self.memory_file}: {e}")
	
	def update_user_profile(self, profile_data: Dict[str, Any]) -> None:
		"""Update user profile information."""
		self.data["user_profile"].update(profile_data)
		self.save_memory()
	
	def get_user_profile(self) -> Dict[str, Any]:
		"""Get current user profile."""
		return self.data["user_profile"].copy()
	
	def add_conversation_entry(self, agent: str, user_input: str, agent_response: str) -> None:
		"""Add conversation entry to history."""
		entry = {
			"timestamp": datetime.now().isoformat(),
			"agent": agent,
			"user_input": user_input,
			"agent_response": agent_response
		}
		self.data["conversation_history"].append(entry)
		self.save_memory()
	
	def get_conversation_history(self, last_n: int = None) -> List[Dict[str, Any]]:
		"""Get conversation history, optionally limited to last N entries."""
		history = self.data["conversation_history"]
		if last_n:
			return history[-last_n:]
		return history.copy()
	
	def set_current_topic(self, topic: str) -> None:
		"""Set the current learning topic."""
		self.data["current_topic"] = topic
		self.save_memory()
	
	def get_current_topic(self) -> str:
		"""Get the current learning topic."""
		return self.data["current_topic"]
	
	def start_qa_session(self, concept_focus: str) -> None:
		"""Start a new Socratic Q&A session."""
		self.data["qa_session"] = {
			"active": True,
			"concept_focus": concept_focus,
			"question_count": 0,
			"student_responses": [],
			"comprehension_assessment": "",
			"start_time": datetime.now().isoformat()
		}
		self.save_memory()
	
	def add_qa_interaction(self, question: str, student_response: str) -> None:
		"""Add Q&A interaction to current session."""
		if self.data["qa_session"]["active"]:
			self.data["qa_session"]["question_count"] += 1
			self.data["qa_session"]["student_responses"].append({
				"question": question,
				"response": student_response,
				"timestamp": datetime.now().isoformat()
			})
			self.save_memory()
	
	def end_qa_session(self, assessment: str, summary: str) -> None:
		"""End the current Q&A session with assessment."""
		if self.data["qa_session"]["active"]:
			self.data["qa_session"]["active"] = False
			self.data["qa_session"]["comprehension_assessment"] = assessment
			self.data["qa_session"]["session_summary"] = summary
			self.data["qa_session"]["end_time"] = datetime.now().isoformat()
			
			# Add concept to learning progress
			concept = self.data["qa_session"]["concept_focus"]
			if concept not in self.data["learning_progress"]["concepts_covered"]:
				self.data["learning_progress"]["concepts_covered"].append(concept)
			
			self.save_memory()
	
	def get_qa_session(self) -> Dict[str, Any]:
		"""Get current Q&A session state."""
		return self.data["qa_session"].copy()
	
	def get_learning_progress(self) -> Dict[str, Any]:
		"""Get learning progress summary."""
		return self.data["learning_progress"].copy()
	
	def clear_memory(self) -> None:
		"""Clear all memory and start fresh."""
		self.data = self._create_empty_memory()
		self.save_memory()


# Global shared memory instance
shared_memory = SharedMemory()