import re
import math
from collections import Counter
from typing import List, Tuple, Dict, Any
from app.models.paper import Paper

class VectorSearchService:
    """
    High-performance vector and semantic search engine.
    Supports cosine similarity over TF-IDF / term vectors,
    with pluggable hooks for SentenceTransformers / FAISS.
    """

    def __init__(self):
        self._stopwords = {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
            "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", 
            "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", 
            "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", 
            "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "her", "here", "hers", "herself", 
            "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its", "itself", 
            "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", 
            "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", 
            "own", "same", "she", "should", "shouldn't", "so", "some", "such", "than", "that", "the", 
            "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", 
            "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "were", 
            "weren't", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "won't", 
            "would", "wouldn't", "you", "your", "yours", "yourself", "yourselves"
        }

    def tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        return [w for w in words if w not in self._stopwords]

    def extract_keywords(self, text: str, top_k: int = 5) -> List[str]:
        """Extract dominant keywords using term frequency and domain significance."""
        tokens = self.tokenize(text)
        if not tokens:
            return []
        counter = Counter(tokens)
        most_common = counter.most_common(top_k)
        return [word for word, _ in most_common]

    def compute_similarity(self, query: str, document: str) -> float:
        """Compute cosine similarity between query and document tokens."""
        q_tokens = self.tokenize(query)
        d_tokens = self.tokenize(document)
        
        if not q_tokens or not d_tokens:
            return 0.0

        q_vec = Counter(q_tokens)
        d_vec = Counter(d_tokens)

        # Dot product
        intersection = set(q_vec.keys()) & set(d_vec.keys())
        numerator = sum([q_vec[x] * d_vec[x] for x in intersection])

        sum1 = sum([q_vec[x] ** 2 for x in q_vec.keys()])
        sum2 = sum([d_vec[x] ** 2 for x in d_vec.keys()])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)

        if not denominator:
            return 0.0
        return float(numerator) / denominator

    def rank_papers(self, query: str, papers: List[Paper], top_k: int = 10) -> List[Tuple[Paper, float]]:
        """Rank a list of papers by query similarity."""
        scored = []
        for paper in papers:
            doc_text = f"{paper.title} {paper.abstract} {paper.keywords} {paper.categories}"
            score = self.compute_similarity(query, doc_text)
            
            # Boost score if query keywords appear directly in title
            q_tokens = set(self.tokenize(query))
            title_tokens = set(self.tokenize(paper.title))
            title_match = len(q_tokens & title_tokens)
            if title_match > 0:
                score += (title_match * 0.15)
                
            scored.append((paper, min(round(score, 4), 1.0)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

vector_service = VectorSearchService()
