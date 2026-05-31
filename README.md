# TaskFlow - ToDo List

A full-stack to-do list application built with Django REST Framework and vanilla JavaScript.

---

## Features

- User registration and login with token authentication
- Create, rename, and delete lists
- Add, complete, and delete tasks with optional due dates
- Dynamic sidebar categories
- Search lists by name or task content
- Mobile responsive with sliding sidebar
- Settings page — change username, password, delete account

---

## Tech Stack

**Backend**
- Python 3.14
- Django 6.0
- Django REST Framework
- SQLite (development)

**Frontend**
- Vanilla JavaScript
- Bootstrap 5.3
- Bootstrap Icons

---

## Project Structure
todo-app/
├── backend/
│   ├── taskflow_backend/     # Django project settings
│   ├── tasks/                # Main app (models, views, serializers)
│   ├── manage.py
│   └── requirements.txt
└── frontend/
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   ├── auth.js
│   └── settings.js
├── index.html
├── login.html
└── settings.html

---

## Getting Started

### Prerequisites

- Python 3.10+
- pip

---

### Backend Setup

**1. Clone the repository**
```bash
git clone https://github.com/nazzyvin/todo-app.git
cd todo-app/backend
```

**2. Create and activate a virtual environment**

Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

Mac/Linux:
```bash
python -m venv venv
source venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Run migrations**
```bash
python manage.py migrate
```

**5. Create a superuser (optional, for admin access)**
```bash
python manage.py createsuperuser
```

**6. Start the server**
```bash
python manage.py runserver
```

The backend will be running at `http://127.0.0.1:8000`

---

### Frontend Setup

**1. Open the frontend folder in VS Code**

**2. Install the Live Server extension if you haven't already**

**3. Right-click `login.html` and select "Open with Live Server"**

The frontend will be running at `http://127.0.0.1:5501`

---

### CORS Configuration

Make sure the port Live Server uses matches `CORS_ALLOWED_ORIGINS` in `backend/taskflow_backend/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5501",
    "http://localhost:5501",
]
```

Update the port if Live Server opens on a different one.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register/` | Register a new user |
| POST | `/api/login/` | Login and get token |
| GET | `/api/lists/` | Get all lists |
| POST | `/api/lists/` | Create a list |
| PATCH | `/api/lists/{id}/` | Update a list |
| DELETE | `/api/lists/{id}/` | Delete a list |
| GET | `/api/tasks/` | Get all tasks |
| POST | `/api/tasks/` | Create a task |
| PATCH | `/api/tasks/{id}/` | Update a task |
| DELETE | `/api/tasks/{id}/` | Delete a task |
| PATCH | `/api/auth/update/` | Update username or password |
| DELETE | `/api/auth/delete/` | Delete account |

---

## Author

**Naz-k Vincent** — [@NazzyVin](https://github.com/NazzyVin)

---

## License

This project is open source and available under the [MIT License](LICENSE).