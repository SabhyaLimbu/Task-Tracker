# Task Tracker

A full-stack task management application built with the MERN stack (MongoDB, Express.js, React, Node.js). Users sign up and log in with email and password, then manage their own private task list.

## Features

- Email and password sign up and login
- JWT-based authentication with protected API routes <!-- VERIFY: confirm JWT + password hashing (bcrypt) in Backend/users.js -->
- Protected frontend routes: unauthenticated users are redirected to login
- Per-user task ownership: each task references its owner through a Mongoose schema reference, and users only see their own tasks
- Create, read, update and delete tasks
- Mark tasks as completed
- React Context for authentication state
- RESTful Express API

## Tech Stack

**Frontend:** React, Vite, React Router, React Context API, Axios, CSS
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens, dotenv

## Project Structure

```
Task-Tracker/
├── Backend/
│   ├── models/        # Mongoose models (User, Task)
│   ├── server.js      # Express app entry point
│   └── users.js       # Auth routes
└── Frontend/
    └── src/
        ├── api/         # auth.js, tasks.js (API calls)
        ├── components/  # Header, Footer, Button, TaskItem, ProtectedRoute
        ├── contexts/    # Authentication context
        └── pages/
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/SabhyaLimbu/Task-Tracker.git
cd Task-Tracker
```

### 2. Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` folder (see `.env.example`):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the server:

```bash
npm run dev
```

### 3. Frontend setup

In a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on the URL Vite prints (by default `http://localhost:5173`) and the backend on `http://localhost:5000`. <!-- VERIFY: ports and script names against package.json -->

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Create a new account |
| POST | `/api/users/login` | Log in and receive a JWT |

<!-- VERIFY: replace these paths with the real ones from Backend/users.js and server.js -->

### Tasks (require a valid token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get the logged-in user's tasks |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `PORT` | Port for the Express server |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify JWTs |

Never commit your `.env` file.

## Future Improvements

- Task categories and priority levels
- Due dates and reminders
- Search and filtering
- Unit and integration tests
- CI with GitHub Actions
- Deployment

## What I Learned

- Designing a RESTful API with Express and Mongoose
- Implementing authentication and protecting both API and frontend routes
- Modelling data ownership with Mongoose references
- Managing auth state in React with Context
- Handling environment variables and keeping secrets out of version control
