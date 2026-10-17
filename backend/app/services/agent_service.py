import json
import logging
from typing import List, Dict, Any, Optional
import requests

from app.core.config import settings
from app.models.schemas import ToolExecutionLog, AgentChatResponse
from app.models.paper import Paper
from app.services.vector_service import vector_service

logger = logging.getLogger(__name__)

class ResearchAgentService:
    """
    Agentic workflow orchestrator.
    Executes dynamic tool routing:
    1. search_and_summarize
    2. extract_keywords
    3. compare_papers
    """

    def search_and_summarize(self, query: str, papers: List[Paper], k: int = 3) -> Dict[str, Any]:
        """Tool 1: Search top papers and synthesize a summary."""
        ranked = vector_service.rank_papers(query, papers, top_k=k)
        summaries = []
        for paper, score in ranked:
            summaries.append({
                "id": paper.id,
                "title": paper.title,
                "score": score,
                "summary": paper.summary or (paper.abstract[:280] + "..." if len(paper.abstract) > 280 else paper.abstract)
            })
        return {
            "query": query,
            "matched_papers": summaries
        }

    def extract_keywords(self, text: str, top_k: int = 5) -> List[str]:
        """Tool 2: Extract top domain keywords."""
        return vector_service.extract_keywords(text, top_k=top_k)

    def compare_papers(self, paper_a: Paper, paper_b: Paper) -> Dict[str, Any]:
        """Tool 3: Compare two papers on methodology and key insights."""
        kw_a = vector_service.extract_keywords(paper_a.abstract, top_k=6)
        kw_b = vector_service.extract_keywords(paper_b.abstract, top_k=6)
        
        common_topics = list(set(kw_a) & set(kw_b))
        sim_score = vector_service.compute_similarity(paper_a.abstract, paper_b.abstract)

        return {
            "paper_1": {"id": paper_a.id, "title": paper_a.title, "keywords": kw_a},
            "paper_2": {"id": paper_b.id, "title": paper_b.title, "keywords": kw_b},
            "shared_keywords": common_topics,
            "similarity_index": round(sim_score, 3),
            "comparative_analysis": (
                f"Comparison between '{paper_a.title}' and '{paper_b.title}': "
                f"Both papers explore overlapping domains in {', '.join(common_topics) if common_topics else 'computer science'}. "
                f"Paper 1 emphasizes {', '.join(kw_a[:3])}, whereas Paper 2 focuses on {', '.join(kw_b[:3])}."
            )
        }

    def run_agent(self, user_message: str, all_papers: List[Paper]) -> AgentChatResponse:
        """
        Agent orchestration loop.
        Inspects intent, dispatches tools, logs actions, and generates synthesis.
        """
        tool_logs: List[ToolExecutionLog] = []
        sources: List[int] = []
        msg_lower = user_message.lower()

        # Intent 1: Keyword extraction
        if "keyword" in msg_lower or "extract" in msg_lower or "keybert" in msg_lower:
            target_paper = None
            for p in all_papers:
                if p.title.lower() in msg_lower or any(word in p.title.lower() for word in vector_service.tokenize(user_message)):
                    target_paper = p
                    break
            
            text_to_analyze = target_paper.abstract if target_paper else user_message
            keywords = self.extract_keywords(text_to_analyze, top_k=6)
            
            if target_paper:
                sources.append(target_paper.id)

            tool_logs.append(ToolExecutionLog(
                tool_name="extract_keywords",
                tool_args={"text": text_to_analyze[:120] + "...", "top_k": 6},
                output=keywords
            ))

            paper_ref = f" from '{target_paper.title}'" if target_paper else ""
            response_text = (
                f"### Extracted Keywords{paper_ref}\n\n"
                f"Using KeyBERT keyword extraction, the following primary concepts were identified:\n\n"
                + "\n".join([f"- **{kw}**" for kw in keywords])
                + f"\n\n*Relevance Score:* High density match for core academic topics."
            )
            return AgentChatResponse(response=response_text, tool_calls=tool_logs, sources=sources)

        # Intent 2: Compare papers
        if "compare" in msg_lower or "versus" in msg_lower or " vs " in msg_lower or "difference between" in msg_lower:
            candidates = vector_service.rank_papers(user_message, all_papers, top_k=2)
            if len(candidates) >= 2:
                p1, _ = candidates[0]
                p2, _ = candidates[1]
                comp_data = self.compare_papers(p1, p2)
                sources.extend([p1.id, p2.id])
                
                tool_logs.append(ToolExecutionLog(
                    tool_name="compare_papers",
                    tool_args={"paper_1_id": p1.id, "paper_2_id": p2.id},
                    output=comp_data
                ))

                response_text = (
                    f"### Comparative Paper Analysis\n\n"
                    f"**Paper 1:** {p1.title}\n"
                    f"**Paper 2:** {p2.title}\n\n"
                    f"**Semantic Similarity Index:** `{comp_data['similarity_index']}`\n\n"
                    f"**Shared Concepts:** {', '.join(comp_data['shared_keywords']) if comp_data['shared_keywords'] else 'Diverse subfields'}\n\n"
                    f"**Synthesis:**\n{comp_data['comparative_analysis']}"
                )
                return AgentChatResponse(response=response_text, tool_calls=tool_logs, sources=sources)

        # Intent 3: Search, Retrieve, and Summarize (RAG default)
        search_res = self.search_and_summarize(user_message, all_papers, k=3)
        tool_logs.append(ToolExecutionLog(
            tool_name="search_and_summarize",
            tool_args={"query": user_message, "k": 3},
            output=search_res
        ))

        matched = search_res["matched_papers"]
        for m in matched:
            sources.append(m["id"])

        # If Groq API key is present, let's call Llama-3.1 for high-fidelity synthesis
        if settings.GROQ_API_KEY:
            try:
                headers = {
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json"
                }
                context = "\n\n".join([f"Title: {m['title']}\nSummary: {m['summary']}" for m in matched])
                payload = {
                    "model": settings.GROQ_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an intelligent academic research assistant. Answer the user query clearly and accurately using the provided research paper contexts."
                        },
                        {
                            "role": "user",
                            "content": f"Context Papers:\n{context}\n\nUser Question: {user_message}"
                        }
                    ],
                    "temperature": 0.2
                }
                res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
                if res.status_code == 200:
                    groq_reply = res.json()["choices"][0]["message"]["content"]
                    return AgentChatResponse(response=groq_reply, tool_calls=tool_logs, sources=sources)
            except Exception as e:
                logger.warning(f"Groq API call fallback: {e}")

        # High-quality structured fallback response
        paper_points = "\n\n".join([
            f"**{i+1}. {m['title']}** (Relevance: `{m['score']}`)\n>{m['summary']}"
            for i, m in enumerate(matched)
        ])
        
        response_text = (
            f"### Research Intelligence Synthesis\n\n"
            f"Based on your query *\"{user_message}\"*, the agent retrieved the most relevant research papers from the index:\n\n"
            f"{paper_points}\n\n"
            f"---\n"
            f"**Key Takeaway:** The retrieved literature emphasizes practical implementations, algorithmic optimizations, and benchmark evaluations in this domain."
        )

        return AgentChatResponse(response=response_text, tool_calls=tool_logs, sources=sources)

agent_service = ResearchAgentService()
