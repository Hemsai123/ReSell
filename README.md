# OLX Clone - Django + React

An OLX-style classifieds platform with a Django REST API backend and React frontend.

## Project Structure

```
OLX-Project/
├── backend/                  # Django backend (existing project, enhanced)
│   ├── manage.py
│   ├── requirements.txt
│   ├── olx/                  # Project settings package
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── accounts/             # User registration app
│   │   ├── serializers.py    # NEW: API serializers
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── templates/
│   ├── product/              # Products app
│   │   ├── serializers.py    # NEW: API serializers
│   │   ├── views.py          # Enhanced with API views
│   │   ├── urls.py           # Includes API routes
│   │   ├── models.py
│   │   └── templates/
│   ├── home/                 # Home page app
│   ├── static/               # Static files
│   ├── templates/            # Global templates
│   └── media/                # Uploaded files
├── frontend/                 # React frontend (NEW)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env
│   └── src/
│       ├── assets/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Page components
│       ├── layouts/          # Layout wrappers
│       ├── services/         # API service layer
│       ├── hooks/            # Custom React hooks
│       ├── context/          # React contexts
│       ├── utils/            # Utility functions
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── database/
│   └── mysql/
│       └── db.sqlite3        # Existing SQLite (for reference)
├── .env                      # Environment variables
├── .gitignore
└── README.md
```

## Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL 5.7+

## Backend Setup

1. **Create MySQL database:**
   ```bash
   mysql -u root -p -e "CREATE DATABASE olx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. **Create virtual environment and install dependencies:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or: venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

3. **Configure environment variables** in `../.env`

4. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the server:**
   ```bash
   python manage.py runserver
   ```

Backend runs at `http://localhost:8000`

## Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL** in `frontend/.env`

3. **Run development server:**
   ```bash
   npm run dev
   ```

Frontend runs at `http://localhost:5173`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Register new user |
| `/api/auth/login/` | POST | Login, get token |
| `/api/auth/logout/` | POST | Logout, delete token |
| `/api/auth/user/` | GET | Get current user |
| `/api/products/` | GET | List products (supports `?search=`, `?category=`, `?ordering=`) |
| `/api/products/` | POST | Create product (auth required) |
| `/api/products/{slug}/` | GET | Product detail |
| `/api/products/{slug}/` | PUT/PATCH | Update product (owner only) |
| `/api/products/{slug}/` | DELETE | Delete product (owner only) |
| `/api/products/my_listings/` | GET | List current user's products |
| `/api/categories/` | GET | List categories |
| `/api/categories/{slug}/` | GET | Category detail |
| `/api/brands/` | GET | List brands |

## Authentication

The API uses token authentication. Include the token in the `Authorization` header:

```
Authorization: Token <your-token>
```

## Key Design Decisions

- **Django REST Framework** added for API layer without removing existing template-based views
- **Token authentication** for stateless API access from React
- **CORS configured** to allow the Vite dev server (port 5173) to communicate with Django (port 8000)
- **MySQL** as the production database (configured via environment variables)
- **React Router** for client-side routing
- **Axios interceptors** for automatic token injection and 401 handling
