# SciFind

SciFind is a full-stack web application for searching, browsing, and analyzing scientific papers, with a focus on arXiv content. It features a modern frontend, a Node.js backend API, and a Python-based machine learning model service.

## Features

- **Search arXiv Papers:** Fast, full-text and enhanced search with scoring.
- **Category Browsing:** Filter and explore papers by category.
- **Paper Details:** View abstracts, download PDFs, and source files.
- **Recent Searches & Popular Categories:** Personalized and trending content.
- **Modern UI:** Built with Nuxt.js and Tailwind CSS for a responsive experience.
- **Backend API:** Node.js/Express API with Elasticsearch integration.
- **ML Model Service:** Python FastAPI service for embeddings and advanced features.
- **Docker Support:** Easy local development and deployment.

## Project Structure

```
SciFind/
├── backend/         # Node.js/Express API server
│   ├── src/         # Controllers, routes, services, config
│   ├── server.js    # Main server entry point
│   └── ...
├── frontend/        # Nuxt.js 3 frontend app
│   ├── components/  # Vue components
│   ├── pages/       # App pages
│   └── ...
├── model/           # Python FastAPI ML service
│   ├── app/         # Main app, models, services
│   └── ...
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Python 3.8+
- Docker (optional, for full stack setup)

### 1. Clone the Repository

```sh
git clone https://github.com/trihuynhnhut0107/SciFind.git
cd SciFind
```

### 2. Start the Backend API

```sh
cd backend
npm install
npm start
```

### 3. Start the Frontend

```sh
cd ../frontend
npm install
npm run dev
```

### 4. Start the Model Service

```sh
cd ../model
pip install -r requirements.txt
python -m app.main
```

### 5. (Optional) Run with Docker Compose

```sh
cd backend
# Edit docker-compose.yaml as needed
# Then run:
docker-compose up --build
```

## API Documentation

See `backend/API_DOCUMENTATION.md` for details on available endpoints and usage.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License. See `model/LICENSE` for details.
