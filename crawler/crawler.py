from bs4 import BeautifulSoup
import requests

def crawl_arxiv_article_title(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        title_tag = soup.find("h1", class_="title")
        title = title_tag.text.replace("Title:", "").strip() if title_tag else "No title found"
        return title
    except requests.exceptions.RequestException as e:
        return f"Error fetching {url}: {e}"

def get_arxiv_article_links(category_url, limit=10):
    try:
        response = requests.get(category_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract links to article abstracts
        links = []
        for dt in soup.find_all('dt'):
            link_tag = dt.find('a', title='Abstract')
            if link_tag and link_tag.get('href'):
                full_link = "https://arxiv.org" + link_tag['href']
                links.append(full_link)
                if len(links) >= limit:
                    break
        return links
    except requests.exceptions.RequestException as e:
        print(f"Failed to get article list: {e}")
        return []

# Main logic
category_url = "https://arxiv.org/list/cs.AI/recent"
article_links = get_arxiv_article_links(category_url, limit=10)

print("Latest 10 Arxiv Titles (cs.AI):\n")
for i, link in enumerate(article_links, 1):
    title = crawl_arxiv_article_title(link)
    print(f"{i}. {title}")
