from fastapi import FastAPI, HTTPException
from elasticsearch import Elasticsearch
from pydantic import BaseModel

app = FastAPI()

# Initialize Elasticsearch client
es = Elasticsearch(
    hosts=["http://elasticsearch:9200"],
    headers={
        "Accept": "application/vnd.elasticsearch+json;compatible-with=8",
        "Content-Type": "application/vnd.elasticsearch+json;compatible-with=8"
    }
)

@app.get("/")
def read_root():
    return {"message": "Welcome to SciFind Backend!"}

@app.get("/test-elasticsearch")
def test_elasticsearch():
    try:
        # Perform a health check on Elasticsearch
        health = es.cluster.health()
        return {"status": "Elasticsearch is connected!", "health": health}
    except Exception as e:
        return {"error": str(e)}

# Define a model for search queries
class SearchQuery(BaseModel):
    query: str

@app.post("/search")
def search_papers(search_query: SearchQuery):
    try:
        # Perform a search in Elasticsearch
        response = es.search(index="research-papers", body={
            "query": {
                "multi_match": {
                    "query": search_query.query,
                    "fields": ["title", "abstract", "authors"]
                }
            }
        })
        return {"results": response["hits"]["hits"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))