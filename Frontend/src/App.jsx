import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TaskItem from './components/TaskItem';
import Header from './components/Header';
import Footer from "./components/Footer";
import Button from './components/Button';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { AddTask, DeleteTask, FetchTasks, UpdateTask } from './api/tasks';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const serverTasks = await FetchTasks();
        setTasks(serverTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        alert('Failed to load tasks. Please check your connection.');
      }
    };

    loadTasks();
  }, []);

  const toggleComplete = async (id, updates) => {
    try {
      const taskToUpdate = tasks.find(task => task._id === id);
      if (!taskToUpdate) return;
      
      const newUpdates = updates || { completed: !taskToUpdate.completed };
      
      await UpdateTask(id, newUpdates);
      window.location.reload();
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await DeleteTask(id);
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const editItem = async (id) => {
    const taskToEdit = tasks.find(task => task._id === id);
    if (!taskToEdit) return;

    const newTitle = prompt('Enter new task title:', taskToEdit.title);
    if (!newTitle || newTitle.trim() === '') return;

    try {
      await UpdateTask(id, { title: newTitle });
      window.location.reload();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
  }

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const newTaskObj = {
      title: newTask,
      completed: false,
      user: user._id,
    };

    try {
      await AddTask(newTaskObj);
      window.location.reload();
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('Failed to add task. Please try again.');
    }
  }

  return (
    <div className="App">
      <Header user={user} onLogout={logout} />
      <main>
        <div className="add-task-container">
          <form onSubmit={addTask}>
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask(e)}
            />
            <Button type="submit">Add Task</Button>
          </form>
        </div>
        <div className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onDelete={deleteItem}
              onEdit={editItem}
              onToggle={toggleComplete}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
