import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_health_check():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "documentation" in data or "docs" in data

def test_root_endpoint():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "version" in data

def test_list_papers():
    with TestClient(app) as client:
        response = client.get("/api/v1/papers/")
        assert response.status_code == 200
        data = response.json()
        assert "papers" in data
        assert "total" in data
        assert data["total"] >= 1

def test_search_papers():
    with TestClient(app) as client:
        response = client.get("/api/v1/papers/?query=attention")
        assert response.status_code == 200
        data = response.json()
        assert len(data["papers"]) >= 1
        assert any("Attention" in p["title"] for p in data["papers"])

def test_create_paper_endpoint():
    with TestClient(app) as client:
        payload = {
            "title": "Diffusion Models in Generative AI",
            "abstract": "Denoising diffusion probabilistic models are generative models trained using variational inference...",
            "authors": "Jonathan Ho, Ajay Jain, Pieter Abbeel",
            "categories": "cs.LG",
            "published_date": "2020-06-19"
        }
        response = client.post("/api/v1/papers/?async_processing=false", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == payload["title"]
        assert len(data["keywords"]) > 0

def test_agent_chat_keyword_extraction():
    with TestClient(app) as client:
        payload = {
            "message": "Extract the top keywords from Transformer attention mechanism."
        }
        response = client.post("/api/v1/agent/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["tool_calls"]) > 0
        assert data["tool_calls"][0]["tool_name"] == "extract_keywords"

def test_agent_chat_compare_papers():
    with TestClient(app) as client:
        payload = {
            "message": "Compare Attention Is All You Need versus BERT in terms of architecture and objectives."
        }
        response = client.post("/api/v1/agent/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["tool_calls"]) > 0
        assert data["tool_calls"][0]["tool_name"] == "compare_papers"

def test_agent_chat_search_and_summarize():
    with TestClient(app) as client:
        payload = {
            "message": "What does the literature say about medical image reconstruction?"
        }
        response = client.post("/api/v1/agent/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["tool_calls"]) > 0
        assert data["tool_calls"][0]["tool_name"] == "search_and_summarize"

def test_graph_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/graph/")
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "edges" in data
        assert len(data["nodes"]) >= 1
