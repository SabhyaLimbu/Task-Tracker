import { useState, useEffect, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import TaskItem from './components/TaskItem';
import AppLayout from './components/AppLayout';
import Button from './components/Button';
import StatsCards from './components/StatsCards';
import TaskFilters from './components/TaskFilters';
import RemindersBanner from './components/RemindersBanner';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import ProtectedRoute from './components/ProtectedRoute';
import { useTaskMeta } from './hooks/useTaskMeta';
import { useTaskOrder, applyOrder } from './hooks/useTaskOrder';
import { useReminders } from './hooks/useReminders';
import {
  PRIORITY_RANK,
  computeCounts,
  matchesDueFilter,
  nextDueDate,
} from './utils/taskUtils';
import { exportCsv, exportPdf } from './utils/exportTasks';
import {
  AddTask,
  DeleteTask,
  FetchTasks,
  UpdateTask,
} from './api/tasks';

const VIEWS = ['active', 'completed', 'archived'];

const VIEW_TITLES = {
  all: 'Make today count',
  active: 'Still to do',
  completed: 'Well done',
  archived: 'Your archive',
};

// Support APIs that return either a task or a response wrapper.
const extractTask = (result) =>
  result?.task || result?.data?.task || result?.data || result;

const AppContent = () => {
  const { user, logout } = useAuth();
  const { meta, setTaskMeta, removeTaskMeta } = useTaskMeta(user);
  const { order, saveOrder } = useTaskOrder(user);
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDue, setNewDue] = useState('');
  const [newRepeat, setNewRepeat] = useState('none');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dueFilter, setDueFilter] = useState('any');
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  // The sidebar links drive the filter through ?view=active|completed|archived
  const rawView = searchParams.get('view');
  const filter = VIEWS.includes(rawView) ? rawView : 'all';
  const setFilter = (key) =>
    setSearchParams(key === 'all' ? {} : { view: key });

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const serverTasks = await FetchTasks();
        setTasks(serverTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        alert('Failed to load tasks. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const counts = useMemo(() => computeCounts(tasks, meta), [tasks, meta]);

  const liveTasks = useMemo(
    () => tasks.filter((task) => !meta[task._id]?.archived),
    [tasks, meta]
  );

  const reminders = useReminders(liveTasks, meta);

  /* ---------- Task actions ---------- */

  // When a recurring task is completed, create the next occurrence.
  const spawnNext = async (task, info) => {
    try {
      const result = await AddTask({
        title: task.title,
        completed: false,
        user: user?._id,
      });
      const created = extractTask(result);

      if (created && created._id) {
        setTasks((current) => [...current, created]);
        setTaskMeta(created._id, {
          priority: info.priority || 'medium',
          due: nextDueDate(info.due, info.repeat),
          repeat: info.repeat,
        });
        // Only the newest occurrence keeps repeating
        setTaskMeta(task._id, { repeat: 'none' });
      } else {
        console.warn('Could not read the new task from the API response.');
      }
    } catch (error) {
      console.error('Failed to create the next occurrence:', error);
      alert('Task completed, but the next repeat could not be created.');
    }
  };

  const toggleComplete = async (id, updates) => {
    const task = tasks.find((item) => item._id === id);
    if (!task) return;

    const changes = updates || { completed: !task.completed };

    try {
      await UpdateTask(id, changes);
      setTasks((current) =>
        current.map((item) =>
          item._id === id ? { ...item, ...changes } : item
        )
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please try again.');
      return;
    }

    const info = meta[id];
    if (changes.completed && info?.repeat && info.repeat !== 'none') {
      await spawnNext(task, info);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await DeleteTask(id);
      setTasks((current) => current.filter((task) => task._id !== id));
      removeTaskMeta(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const clearCompleted = async () => {
    const done = liveTasks.filter((task) => task.completed);
    if (done.length === 0) return;
    if (
      !window.confirm(
        `Delete ${done.length} completed task${done.length > 1 ? 's' : ''}?`
      )
    ) {
      return;
    }

    const results = await Promise.allSettled(
      done.map((task) => DeleteTask(task._id))
    );
    const deletedIds = done
      .filter((_, index) => results[index].status === 'fulfilled')
      .map((task) => task._id);
    const deleted = new Set(deletedIds);

    setTasks((current) => current.filter((task) => !deleted.has(task._id)));
    removeTaskMeta(deletedIds);

    if (deletedIds.length < done.length) {
      alert('Some tasks could not be deleted. Please try again.');
    }
  };

  const editItem = async (id) => {
    const task = tasks.find((item) => item._id === id);
    if (!task) return;

    const newTitle = window.prompt('Enter new task title:', task.title);
    if (newTitle === null || !newTitle.trim()) return;

    const changes = { title: newTitle.trim() };

    try {
      await UpdateTask(id, changes);
      setTasks((current) =>
        current.map((item) =>
          item._id === id ? { ...item, ...changes } : item
        )
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const archiveItem = (id) => setTaskMeta(id, { archived: true });
  const restoreItem = (id) => setTaskMeta(id, { archived: false });

  const addTask = async (event) => {
    event.preventDefault();

    const title = newTask.trim();
    if (!title || saving) return;

    try {
      setSaving(true);
      const result = await AddTask({
        title,
        completed: false,
        user: user?._id,
      });
      const createdTask = extractTask(result);

      if (createdTask && createdTask._id) {
        setTasks((current) => [...current, createdTask]);
        setTaskMeta(createdTask._id, {
          priority: newPriority,
          due: newDue,
          repeat: newRepeat,
        });
      } else {
        const refreshedTasks = await FetchTasks();
        setTasks(refreshedTasks);
      }

      setNewTask('');
      setNewPriority('medium');
      setNewDue('');
      setNewRepeat('none');
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('Failed to add task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Drag and drop ordering ---------- */

  const clearDrag = () => {
    setDragId(null);
    setOverId(null);
  };

  const handleDrop = (targetId) => {
    if (dragId && dragId !== targetId) {
      const ids = applyOrder(tasks, order).map((task) => task._id);
      const from = ids.indexOf(dragId);
      const to = ids.indexOf(targetId);
      if (from >= 0 && to >= 0) {
        ids.splice(from, 1);
        ids.splice(to, 0, dragId);
        saveOrder(ids);
      }
    }
    clearDrag();
  };

  /* ---------- Filtering and sorting ---------- */

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const pool = tasks.filter(
      (task) => !!meta[task._id]?.archived === (filter === 'archived')
    );

    const list = pool.filter((task) => {
      const info = meta[task._id] || {};
      if (filter === 'active' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;
      if (priorityFilter !== 'all' && (info.priority || 'medium') !== priorityFilter) {
        return false;
      }
      if (!matchesDueFilter(task, info, dueFilter)) return false;
      return !query || task.title.toLowerCase().includes(query);
    });

    if (sort === 'due') {
      return [...list].sort((a, b) => {
        const da = meta[a._id]?.due || '9999-99-99';
        const db = meta[b._id]?.due || '9999-99-99';
        return da.localeCompare(db);
      });
    }

    if (sort === 'priority') {
      return [...list].sort(
        (a, b) =>
          PRIORITY_RANK[meta[a._id]?.priority || 'medium'] -
          PRIORITY_RANK[meta[b._id]?.priority || 'medium']
      );
    }

    return applyOrder(list, order);
  }, [tasks, meta, order, filter, search, sort, priorityFilter, dueFilter]);

  const canDrag = sort === 'default' && filter !== 'archived';

  const emptyState = () => {
    if (tasks.length === 0) {
      return {
        icon: '✦',
        title: 'A fresh start!',
        text: 'Add your first task above and make today productive.',
      };
    }
    if (filter === 'archived' && counts.archived === 0) {
      return {
        title: 'Archive is empty',
        text: 'Archived tasks are kept here, out of your active list.',
      };
    }
    return {
      title: 'No matching tasks',
      text: 'Try a different filter or search term.',
    };
  };

  const empty = emptyState();

  return (
    <AppLayout user={user} onLogout={logout} counts={loading ? null : counts}>
      <div className="page-hero">
        <span className="eyebrow">YOUR PERSONAL WORKSPACE</span>
        <h1>{VIEW_TITLES[filter]}<span>.</span></h1>
        <p>Small steps every day lead to big results.</p>
      </div>

      {!loading && (
        <RemindersBanner
          summary={reminders.summary}
          permission={reminders.permission}
          onEnable={reminders.enable}
        />
      )}

      <div className="dashboard-grid">
        <section className="panel task-panel">
          <div className="task-panel-heading">
            <div>
              <h2>My tasks</h2>
              <p>Keep track of what matters to you.</p>
            </div>

            <div className="task-counter">
              <span>{counts.completed}</span> / {counts.all} completed
            </div>
          </div>

          <form className="add-task-container" onSubmit={addTask}>
            <input
              type="text"
              className="add-task-input"
              aria-label="New task"
              placeholder="What would you like to accomplish?"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              maxLength={200}
            />
            <select
              className="select-input"
              aria-label="Priority"
              value={newPriority}
              onChange={(event) => setNewPriority(event.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              className="date-input"
              aria-label="Due date"
              value={newDue}
              onChange={(event) => setNewDue(event.target.value)}
            />
            <select
              className="select-input"
              aria-label="Repeat"
              value={newRepeat}
              onChange={(event) => setNewRepeat(event.target.value)}
            >
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <Button type="submit" disabled={saving || !newTask.trim()}>
              {saving ? 'Adding...' : '+ Add Task'}
            </Button>
          </form>

          {tasks.length > 0 && (
            <TaskFilters
              filter={filter}
              onFilterChange={setFilter}
              search={search}
              onSearchChange={setSearch}
              sort={sort}
              onSortChange={setSort}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              dueFilter={dueFilter}
              onDueFilterChange={setDueFilter}
              counts={counts}
              onClearCompleted={clearCompleted}
              onExportCsv={() => exportCsv(tasks, meta)}
              onExportPdf={() => exportPdf(tasks, meta)}
            />
          )}

          <div className="task-list">
            {loading ? (
              <div className="empty-state">
                <p>Loading your tasks...</p>
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="empty-state">
                {empty.icon && <div className="empty-icon">{empty.icon}</div>}
                <h3>{empty.title}</h3>
                <p>{empty.text}</p>
              </div>
            ) : (
              visibleTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  info={meta[task._id]}
                  archivedView={filter === 'archived'}
                  draggable={canDrag}
                  dragging={dragId === task._id}
                  dragOver={!!dragId && overId === task._id && dragId !== task._id}
                  onDragStartItem={setDragId}
                  onDragOverItem={setOverId}
                  onDropItem={handleDrop}
                  onDragEndItem={clearDrag}
                  onDelete={deleteItem}
                  onEdit={editItem}
                  onToggle={toggleComplete}
                  onArchive={archiveItem}
                  onRestore={restoreItem}
                  onMetaChange={setTaskMeta}
                />
              ))
            )}
          </div>
        </section>

        <div className="side-column">
          {!loading && <StatsCards tasks={liveTasks} meta={meta} />}
        </div>
      </div>
    </AppLayout>
  );
};

const App = () => (
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
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </Router>
);

export default App;