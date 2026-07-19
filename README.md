# 🧠 Agentic AI Research Paper Intelligence System

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![LangChain](https://img.shields.io/badge/LangChain-Enabled-green.svg)
![FAISS](https://img.shields.io/badge/FAISS-Vector%20Search-orange.svg)
![Groq](https://img.shields.io/badge/Groq-LLM-black.svg)
![License](https://img.shields.io/badge/License-MIT-purple.svg)

An advanced, AI-powered pipeline designed to intelligently process, index, and analyze research papers using Large Language Models (LLMs) and agentic workflows. By leveraging state-of-the-art NLP models, embedding techniques, and conversational agents, this system transforms raw academic datasets into an interactive, queryable knowledge base.

---

## ✨ Features

- **Automated Data Ingestion**: Seamlessly load and preprocess research paper datasets using Hugging Face `datasets` and `pandas`.
- **Semantic Vector Search**: Generate dense embeddings using `sentence-transformers` and index them with **FAISS** for lightning-fast semantic retrieval.
- **Agentic Workflow Architecture**: Utilize **LangChain** and **LangGraph** to orchestrate intelligent AI agents capable of routing queries to specialized tools.
- **LLM Integration via Groq**: Powered by **ChatGroq** for high-speed, accurate reasoning and conversational intelligence.
- **Keyword & Entity Extraction**: Integrates **KeyBERT** and Hybrid NER for extracting the most critical keywords and entities from academic literature.
- **Paper Comparison & Summarization**: Dedicated tools for comparing multiple papers and summarizing their key contributions in markdown format.

---

## 🛠️ Tech Stack

- **Core**: Python, Pandas, NumPy
- **Machine Learning & NLP**: Hugging Face Transformers, Sentence-Transformers, KeyBERT
- **Vector Database**: FAISS (Facebook AI Similarity Search)
- **Agent Framework**: LangChain, LangChain Core
- **LLM Provider**: Groq (via `langchain_groq`)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Python 3.9+ installed. The project is structured as a Jupyter Notebook for interactive execution and easy experimentation.

### Installation

1. Clone the repository (or download the source code):
   ```bash
   git clone https://github.com/your-username/agentic-research-intelligence.git
   cd agentic-research-intelligence
   ```

2. Open the Jupyter Notebook:
   ```bash
   jupyter notebook Agentic_AI_Research_Paper_Intelligence.ipynb
   ```
   *(Alternatively, you can run it directly on Google Colab)*

3. Install the required dependencies within the first cell of the notebook, which typically include:
   ```bash
   pip install datasets pandas sentence-transformers faiss-cpu transformers huggingface_hub keybert langchain langchain_groq
   ```

### Configuration

You will need a valid **Groq API Key** to power the LangChain agent. Set your API key in your environment or within the Colab `userdata` secrets:
```python
os.environ["GROQ_API_KEY"] = "your-groq-api-key-here"
```

---

## 📖 Usage

1. **Initialize the Database**: Run the initial cells to download the research paper dataset, generate sentence embeddings, and build the FAISS index.
2. **Setup the Agent**: Initialize the `ChatGroq` LLM and the LangChain toolset (Search, Keyword Extraction, Compare Papers).
3. **Query the System**: Pass natural language queries to the agent. Examples:
   - *"Extract the top 5 keywords from Deep Learning for Medical Image Reconstruction."*
   - *"Find papers related to hybrid NER architectures and compare their methodologies."*
   - *"What are the most recent advancements in agentic workflows based on the database?"*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue if you encounter any bugs or have feature requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
