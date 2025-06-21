# crawlers/arxiv.py
from bs4 import BeautifulSoup
import requests
import feedparser
import time

def get_arxiv_categories():
    url = "https://arxiv.org/category_taxonomy"
    try:
        res = requests.get(url)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        cats = set()
        for a in soup.select('a[href^="/list/"]'):
            parts = a['href'].strip('/').split('/')
            if len(parts) == 2:
                cats.add(parts[1])
        return list(cats)
    except Exception as e:
        print(f"[ERROR] Fetching categories failed: {e}")
        return []

def fetch_arxiv_articles_api(query, start=0, max_results=100):
    base_url = "http://export.arxiv.org/api/query?"
    url = f"{base_url}search_query={query}&start={start}&max_results={max_results}"
    feed = feedparser.parse(url)
    articles = []
    for entry in feed.entries:
        articles.append({
            "id": entry.id.split('/')[-1],  # Use arXiv ID as doc ID
            "title": entry.title,
            "summary": entry.summary,
            "authors": [author.name for author in entry.authors],
            "published": entry.published,
            "updated": entry.updated,
            "categories": [tag['term'] for tag in entry.tags] if 'tags' in entry else [],
            "link": entry.link
        })
    return articles

def fetch_all_arxiv_articles(batch_size=100):
    categories = get_arxiv_categories()
    all_articles = []
    for cat in categories:
        print(f"[CATEGORY] Fetching: {cat}")
        start = 0
        while True:
            articles = fetch_arxiv_articles_api(query=f"cat:{cat}", start=start, max_results=batch_size)
            if not articles:
                break
            all_articles.extend(articles)
            if len(articles) < batch_size:
                break
            start += batch_size
            time.sleep(3)
    return all_articles
