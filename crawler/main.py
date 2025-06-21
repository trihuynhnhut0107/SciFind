from crawlers.arxiv import fetch_all_arxiv_articles
from pipelines.save_to_db import SaveToElasticsearch


def main():
    es_pipeline = SaveToElasticsearch()
    index_name = "arxiv-papers"
    es_pipeline.delete_index(index=index_name)
    # You can specify categories or use the default in fetch_all_arxiv_articles
    all_articles = fetch_all_arxiv_articles()
    es_pipeline.save_bulk(index=index_name, docs=all_articles)


if __name__ == "__main__":
    main()
