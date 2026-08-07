# Task Tracker

A full-stack Task Tracker web application that allows users to create, manage, update, and delete tasks. Users can also authenticate using Google OAuth.

## Features

- User authentication (Google OAuth)
- Create, edit, and delete tasks
- Mark tasks as completed
- Responsive user interface
- REST API backend
- MongoDB database

## Tech Stack

### Frontend
- React
- JavaScript
- CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Project Structure

```
Task-Tracker/
├── Frontend/
├── Backend/
└── README.md
```

## Installation

### Clone the repository

```bash
git clone https://github.com/SabhyaLimbu/Task-Tracker.git
cd Task-Tracker
```

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Start the backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd ../Frontend
npm install
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /tasks | Get all tasks |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |


## Future Improvements

- Task categories
- Due dates
- Notifications
- Dark mode
- Task search and filtering

## Author

**Sabhya Limbu**

GitHub: https://github.com/SabhyaLimbu
