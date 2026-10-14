# Task Tracker

## Overview

Task Tracker is a full-stack web application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). It allows users to authenticate using Google OAuth and manage their daily tasks efficiently. Users can create, update, delete, and organize tasks through a clean and responsive interface.

This project demonstrates full-stack web development, RESTful API design, authentication, database integration, and frontend-backend communication.

---

## Features

- User authentication using Google OAuth
- Create new tasks
- Update existing tasks
- Delete tasks
- Mark tasks as completed
- Responsive user interface
- RESTful API
- MongoDB database integration

---

## Tech Stack

### Frontend

- React.js
- JavaScript (ES6+)
- HTML5
- CSS3
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Google OAuth
- dotenv

---

## Project Structure

```
Task-Tracker/
│
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── Frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/SabhyaLimbu/Task-Tracker.git
```

Move into the project directory.

```bash
cd Task-Tracker
```

---

## Backend Setup

Navigate to the Backend directory.

```bash
cd Backend
```

Install dependencies.

```bash
npm install
```

Create a `.env` file inside the Backend folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```

Start the backend server.

```bash
npm run dev
```

---

## Frontend Setup

Open another terminal.

Navigate to the Frontend directory.

```bash
cd Frontend
```

Install dependencies.

```bash
npm install
```

Start the React application.

```bash
npm start
```

---

## Application URLs

Frontend

```
http://localhost:3000
```

Backend

```
http://localhost:5000
```

---

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /tasks | Retrieve all tasks |
| POST | /tasks | Create a new task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |

---

## Environment Variables

The following environment variables are required.

```env
PORT=
MONGO_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=
```

Do not commit the `.env` file to GitHub.

---

## Future Improvements

- Task categories
- Task priority levels
- Due dates
- Search and filtering
- Task reminders
- User profiles
- Dark mode
- Drag and drop task organization
- Unit and integration testing

---

## Learning Outcomes

This project helped strengthen my understanding of:

- Full-stack web development using the MERN stack
- RESTful API development with Express.js
- MongoDB database design using Mongoose
- Google OAuth authentication
- Environment variable management
- React component-based architecture
- Client-server communication using Axios
- Version control using Git and GitHub

---

## Author

**Sabhya Limbu**

GitHub: https://github.com/SabhyaLimbu

LinkedIn: 

Email: sabhya89a@gmail.com

---

