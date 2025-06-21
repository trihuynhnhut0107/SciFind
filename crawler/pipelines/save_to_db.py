from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

class SaveToElasticsearch:
    def __init__(self, hosts=None):
        self.es = Elasticsearch(
            hosts=hosts or ["http://localhost:9200"],
            headers={
                "Accept": "application/vnd.elasticsearch+json;compatible-with=8",
                "Content-Type": "application/vnd.elasticsearch+json;compatible-with=8"
            }
        )

    def save(self, index, doc):
        return self.es.index(index=index, document=doc)

    def save_bulk(self, index, docs, chunk_size=500):
        """Bulk index a list of documents into Elasticsearch."""
        actions = [
            {
                "_index": index,
                "_id": doc["id"],  # Use arXiv ID as unique doc ID
                "_source": doc
            }
            for doc in docs
        ]
        return bulk(self.es, actions, chunk_size=chunk_size)


    def delete_index(self, index):
        """Delete an index if it exists."""
        if self.es.indices.exists(index=index):
            self.es.indices.delete(index=index)
