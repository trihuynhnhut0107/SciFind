# SciFind Backend API Documentation

## Enhanced Search Endpoint

### POST `/arxiv-paper/enhanced-search`

This endpoint integrates with a trained model and applies comprehensive filters to search through the ArXiv papers dataset.

#### Request Body

```json
{
  "searchTerm": "machine learning transformers",
  "filters": {
    "categories": ["cs.AI", "cs.LG"],
    "authors": ["John Doe", "Jane Smith"],
    "dateRange": {
      "from": "2020-01-01",
      "to": "2024-12-31"
    },
    "minScore": 0.5,
    "maxResults": 20
  },
  "modelEndpoint": "http://localhost:8000/search"
}
```

#### Request Parameters

- **searchTerm** (required): The search query string
- **filters** (optional): Object containing filter criteria
  - **categories**: Array of category strings to filter by
  - **authors**: Array of author names to filter by
  - **dateRange**: Object with `from` and `to` date strings (YYYY-MM-DD format)
  - **minScore**: Minimum Elasticsearch score threshold
  - **maxResults**: Maximum number of results to return
- **modelEndpoint** (optional): URL of the trained model API (defaults to http://localhost:8000/search)

#### Response

```json
{
  "total": 15,
  "searchTerm": "machine learning transformers",
  "filters": { "categories": ["cs.AI", "cs.LG"] },
  "modelUsed": true,
  "results": [
    {
      "id": "1234.5678",
      "title": "Attention Is All You Need",
      "authors": ["Ashish Vaswani", "Noam Shazeer"],
      "categories": ["cs.AI", "cs.LG"],
      "abstract": "The dominant sequence transduction models...",
      "update_date": "2017-06-12",
      "score": 8.5,
      "modelScore": 0.95,
      "combinedScore": 8.235
    }
  ]
}
```

## Model Health Check

### GET `/model/health`

Check if the trained model is accessible and responsive.

#### Query Parameters

- **endpoint** (optional): Model endpoint URL to test

#### Response

```json
{
  "status": "healthy",
  "endpoint": "http://localhost:8000/search",
  "responseTime": "150ms"
}
```

## Search Suggestions

### GET `/arxiv-paper/suggestions`

Get search suggestions based on existing data in Elasticsearch.

#### Query Parameters

- **term**: Partial search term (minimum 2 characters)

#### Response

```json
[
  {
    "type": "title",
    "value": "Machine Learning in Computer Vision",
    "count": 15
  },
  {
    "type": "category",
    "value": "cs.CV",
    "count": 1250
  }
]
```

## Existing Endpoints

### GET `/arxiv-paper/categories`

Returns all available categories.

### GET `/arxiv-paper/authors`

Returns all available authors.

### GET `/arxiv-paper/:id`

Get a specific paper by ID.

### POST `/arxiv-paper/search`

Basic search without model integration.

## Usage Examples

### Basic Enhanced Search

```javascript
const response = await fetch("/arxiv-paper/enhanced-search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    searchTerm: "neural networks",
    filters: {
      categories: ["cs.AI"],
      maxResults: 10,
    },
  }),
});

const data = await response.json();
console.log(`Found ${data.total} results`);
```

### Search with Date Range

```javascript
const response = await fetch("/arxiv-paper/enhanced-search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    searchTerm: "deep learning",
    filters: {
      dateRange: {
        from: "2023-01-01",
        to: "2024-12-31",
      },
      minScore: 1.0,
    },
  }),
});
```

### Check Model Health

```javascript
const health = await fetch(
  "/model/health?endpoint=http://localhost:8000/search"
);
const status = await health.json();
console.log("Model status:", status.status);
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **400**: Bad Request (missing required parameters)
- **404**: Not Found
- **500**: Internal Server Error
- **503**: Service Unavailable (model health check)

Error responses include details:

```json
{
  "error": "Search failed",
  "details": "Connection timeout",
  "searchTerm": "neural networks"
}
```
