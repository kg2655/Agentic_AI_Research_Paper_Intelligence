# Agentic AI Research Paper Intelligence System

**Course / Project:** AI & Machine Learning Final Project  
**Author:** [Your Name / Student ID]

## 📌 Project Overview

This project is an AI-driven system designed to process, analyze, and query academic research papers. It acts as an intelligent assistant that can read through datasets of research papers and answer queries, extract important keywords, and compare different methodologies using Natural Language Processing (NLP) and Large Language Models (LLMs).

The goal of this project was to learn and implement **Retrieval-Augmented Generation (RAG)** and **Agentic Workflows** using modern AI frameworks.

## 🎯 Objectives

- Build a vector database to store and retrieve research paper embeddings.
- Develop an AI agent that can route queries to specific tools (e.g., search, keyword extraction, or comparison).
- Gain hands-on experience with Hugging Face models, vector search, and LLM orchestration.

## 🛠️ Methodology & Tech Stack

This project was built using the following technologies:
- **Data Handling:** `pandas`, `datasets` (Hugging Face)
- **Embeddings & NLP:** `sentence-transformers` for creating dense vectors, `KeyBERT` for keyword extraction.
- **Vector Search:** `FAISS` to perform fast similarity searches across paper abstracts.
- **LLM & Agents:** `LangChain` and `LangGraph` were used to create the AI agent, powered by the **Groq API** (`ChatGroq`) for fast inference.

## 🚀 How to Run

1. **Prerequisites:** 
   - Python 3.9+ installed.
   - A free API key from [Groq](https://console.groq.com/).

2. **Setup:**
   - Clone this repository.
   - Open `Agentic_AI_Research_Paper_Intelligence.ipynb` in Jupyter Notebook or upload it to Google Colab.
   
3. **Execution:**
   - Run the first cell to install all required libraries (`langchain`, `faiss-cpu`, `sentence-transformers`, etc.).
   - When prompted, securely enter your `GROQ_API_KEY`.
   - Run all subsequent cells to download the dataset, build the FAISS index, and initialize the agent.
   - Test the system by asking the agent questions like: *"Extract the top 5 keywords from Deep Learning for Medical Image Reconstruction."*

## 📚 What I Learned

Throughout this project, I learned how to integrate traditional NLP pipelines with modern LLMs. Using LangChain tools taught me how agents "think" and decide which function to execute based on a user's prompt. 
