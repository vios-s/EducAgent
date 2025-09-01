# EducAgent

An educational Retrieval-Augmented Generation (RAG) system designed to teach and tutor causality concepts using document grounding, semantic search and a Socratic teaching loop.

## Table of contents

- [EducAgent](#educagent)
  - [Table of contents](#table-of-contents)
  - [Description](#description)
  - [Features](#features)
  - [Getting started](#getting-started)
  - [Vector database configuration](#vector-database-configuration)
  - [Usage](#usage)
  - [Components](#components)
  - [How it works](#how-it-works)
  - [Customization](#customization)
  - [Example usage](#example-usage)
  - [Contributing](#contributing)
  - [License](#license)

## Description

EducAgent combines semantic search over textbook PDFs with agentic prompt-based components to create a guided Socratic tutor for causality. The system:

- extracts and chunks PDF content,
- stores chunk embeddings in a vector database (default: ChromaDB),
- uses a query agent to produce optimized semantic search queries,
- retrieves context chunks and passes them to a Socratic QA agent that guides learners through questions and explanations.

The project is intended as a research / teaching prototype and uses OpenAI embeddings/models via the `instructor` and `atomic-agents` libraries.

## Features

- Document chunking with overlap and simple heuristics for robust retrieval
- Pluggable vector database abstraction (`services/`): currently ChromaDB implemented
- Query agent that formulates semantic search queries optimized for causality content
- Socratic QA agent that guides students rather than immediately giving answers
- CLI interface with rich-formatted displays (uses `rich`)

## Getting started

Prerequisites

- Python 3.12+
- Poetry (recommended) or pip
- An OpenAI API key (or compatible embedding/model provider used by `instructor`)

Install (using Poetry)

```powershell
cd C:\Workspace\PostDocWorkspace\EducAgent
poetry install
```

Or install dependencies with pip from `pyproject.toml` manually if you prefer.

Environment variables

Create a `.env` file in the project root (example below). The project reads configuration from environment variables and `educagent/config.py`.

Example `.env` (minimum):

```text
OPENAI_API_KEY=sk-...
VECTOR_DB_TYPE=chroma_db
CHROMA_PERSIST_DIR=./chroma_db
DOCUMENT_DIR=./resources
NUM_CHUNKS_TO_RETRIEVE=5
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

Notes

- By default the code uses `chroma_db` and OpenAI embedding via `OPENAI_API_KEY` to build/store embeddings. See [Vector database configuration](#vector-database-configuration) for details and alternatives.

## Vector database configuration

This project provides a vector DB abstraction in `educagent/services/base.py` and a ChromaDB implementation at `educagent/services/chroma_db.py`.

- Default: ChromaDB persisted to `CHROMA_PERSIST_DIR` (default `./chroma_db`).
- Embeddings: `ChromaDBService` uses `OpenAIEmbeddingFunction` by default and reads `OPENAI_API_KEY` and optional `OPENAI_EMBEDDING_MODEL` from environment.

If you want to change the vector backend (e.g. Qdrant), implement the same interface as `BaseVectorDBService` and adapt `educagent/services/factory.py`.

## Usage

1. Prepare `.env` and place learning PDFs in the directory specified by `DOCUMENT_DIR` (default `./resources`).
2. Build the vector store and start the interactive CLI:

```powershell
# from project root
poetry run python -m educagent.main
```

Or (without poetry):

```powershell
python -m educagent.main
```

On first run the system will chunk documents, compute embeddings and persist them in the configured vector DB directory. Subsequent runs will reuse the persisted collection unless you set the `recreate_collection` flag in code or remove the persist directory.

## Components

- `educagent/main.py` — CLI entrypoint. Orchestrates chunking, DB init, context provider registration and the chat loop.
- `educagent/context_providers.py` — `RAGContextProvider` holds retrieved chunks for agents to consume.
- `educagent/agents/query_agent.py` — Agent that transforms user questions to semantic search queries.
- `educagent/agents/socratic_agent.py` — Socratic QA agent that generates guided questioning and analysis.
- `educagent/services/base.py` — Abstract vector DB service interface.
- `educagent/services/chroma_db.py` — ChromaDB-backed implementation using OpenAI embeddings.
- `educagent/services/factory.py` — Factory to create the configured vector DB service.
- `educagent/config.py` — (project configuration and enums read by the code). Ensure environment variables referenced here are set.

## How it works

High-level flow:

1. Document processing: PDFs in `DOCUMENT_DIR` are read and split into overlapping text chunks (`chunk_document`).
2. Embedding & indexing: chunks are embedded and stored in the configured vector DB (ChromaDB by default).
3. Query formulation: when a user asks a question, `query_agent` formulates a semantic query optimized for retrieving textbook-relevant chunks.
4. Retrieval: the vector DB returns the top-k similar chunks.
5. Socratic tutoring: `qa_agent` receives the question plus retrieved context and responds with guided questions, reasoning and a concept focus.
6. Interactive loop: the CLI displays retrieved chunks, agent reasoning and the Socratic response to the learner.

## Customization

- Change chunking behaviour: edit `chunk_document` in `educagent/main.py` or override `CHUNK_SIZE` / `CHUNK_OVERLAP` via env vars.
- Use a different model or API: update `educagent/agents/*` agent configurations (they use `ChatConfig` / `instructor.from_openai`).
- Swap vector DB: implement a new service conforming to `BaseVectorDBService` and register it in `educagent/services/factory.py`.
- Persist directory and collection options: tune `CHROMA_PERSIST_DIR` and the `create_vector_db_service(...)` call.

Small developer notes

- The project uses `atomic-agents` and `instructor` to define typed agent schemas and system prompts. Keep API keys and sensitive config in `.env` and never commit them.

## Example usage

Quick run (PowerShell):

```powershell
cd C:\Workspace\PostDocWorkspace\EducAgent
# ensure .env is present
poetry run python -m educagent.main
```

Walkthrough

- On start the system will display a welcome panel and example starter prompts.
- Type a natural-language question about causality (or a number for an example prompt).
- The system will show generated search query reasoning, retrieved chunks, and a Socratic teaching response.

Example conversation snippet (conceptual):

1. User: "How is correlation different from causation?"
2. System: shows generated semantic query & retrieved textbook chunks.
3. Socratic agent: asks guided questions like "What evidence would demonstrate that A influences B rather than merely co-occurring?" and progressively scaffolds an explanation.

## Contributing

Contributions are welcome. Please follow standard steps:

1. Fork the repository.
2. Create a feature branch for your change.
3. Run tests / linting locally and ensure no regressions.
4. Open a pull request describing your change and motivation.

For code style and dependencies the project uses `pyproject.toml` (Poetry). Keep changes small and document configuration updates in the README.

## License

This repository includes a `LICENSE` file in the project root — please see `LICENSE` for full terms.

---

<!-- If you want, I can also:

- add a short `docs/` folder with a development walkthrough,
- create a small automated `make`/`poetry` script to bootstrap `.env` and initial DB creation,
- or generate example unit tests for the chunker and the ChromaDB service.

If you'd like any of those, tell me which and I'll implement it next. -->
