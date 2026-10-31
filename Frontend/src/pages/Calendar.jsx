import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTaskMeta } from '../hooks/useTaskMeta';
import { FetchTasks } from '../api/tasks';
import AppLayout from '../components/AppLayout';
import {
  PRIORITY_LABEL,
  addDays,
  computeCounts,
  parseKey,
  toKey,
  todayKey,
} from '../utils/taskUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const Calendar = () => {
  const { user, logout } = useAuth();
  const { meta } = useTaskMeta(user);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => monthStart(new Date()));
  const [selected, setSelected] = useState(todayKey());

  useEffect(() => {
    let cancelled = false;
    FetchTasks()
      .then((data) => !cancelled && setTasks(data))
      .catch((error) => console.error('Failed to fetch tasks:', error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const liveTasks = useMemo(
    () => tasks.filter((task) => !meta[task._id]?.archived),
    [tasks, meta]
  );

  const byDay = useMemo(() => {
    const map = {};
    liveTasks.forEach((task) => {
      const due = meta[task._id]?.due;
      if (!due) return;
      if (!map[due]) map[due] = [];
      map[due].push(task);
    });
    return map;
  }, [liveTasks, meta]);

  const unscheduled = liveTasks.filter(
    (task) => !task.completed && !meta[task._id]?.due
  ).length;

  // 6 weeks starting on the Sunday on/before the 1st
  const cells = useMemo(() => {
    const start = addDays(month, -month.getDay());
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [month]);

  const shiftMonth = (delta) =>
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  const goToday = () => {
    setMonth(monthStart(new Date()));
    setSelected(todayKey());
  };

  const today = todayKey();
  const selectedTasks = byDay[selected] || [];
  const selectedLabel = parseKey(selected).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AppLayout
      user={user}
      onLogout={logout}
      counts={loading ? null : computeCounts(tasks, meta)}
    >
      <div className="page-hero">
        <span className="eyebrow">DEADLINES</span>
        <h1>Calendar<span>.</span></h1>
        <p>See what's due and when. Set due dates on the dashboard.</p>
      </div>

      <div className="dashboard-grid">
        <section className="panel calendar-panel">
          <div className="cal-head">
            <h2>
              {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            <div className="cal-nav">
              <button
                type="button"
                className="round-btn"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
              >
                ‹
              </button>
              <button type="button" className="link-btn" onClick={goToday}>
                Today
              </button>
              <button
                type="button"
                className="round-btn"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
              >
                ›
              </button>
            </div>
          </div>

          <div className="cal-grid cal-weekdays">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="cal-grid">
            {cells.map((date) => {
              const key = toKey(date);
              const items = byDay[key] || [];
              const classes = [
                'cal-cell',
                date.getMonth() !== month.getMonth() && 'muted',
                key === today && 'today',
                key === selected && 'selected',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={key}
                  type="button"
                  className={classes}
                  onClick={() => setSelected(key)}
                  aria-label={`${date.toDateString()}, ${items.length} task${items.length === 1 ? '' : 's'}`}
                >
                  <span className="cal-num">{date.getDate()}</span>
                  {items.slice(0, 2).map((task) => (
                    <span
                      key={task._id}
                      className={`cal-task priority-${meta[task._id]?.priority || 'medium'}${
                        task.completed ? ' done' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                  ))}
                  {items.length > 2 && (
                    <span className="cal-more">+{items.length - 2} more</span>
                  )}
                  {items.length > 0 && <span className="cal-dot" />}
                </button>
              );
            })}
          </div>
        </section>

        <div className="side-column">
          <section className="panel">
            <h2 className="panel-title">{selectedLabel}</h2>
            {loading ? (
              <p className="profile-meta">Loading...</p>
            ) : selectedTasks.length === 0 ? (
              <p className="profile-meta">Nothing due on this day.</p>
            ) : (
              <div className="day-list">
                {selectedTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`day-item${task.completed ? ' done' : ''}`}
                  >
                    <span className="day-title">{task.title}</span>
                    <span
                      className={`chip priority-${meta[task._id]?.priority || 'medium'}`}
                    >
                      {PRIORITY_LABEL[meta[task._id]?.priority || 'medium']}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {unscheduled > 0 && (
              <p className="stat-note">
                {unscheduled} open task{unscheduled === 1 ? '' : 's'} without a due date
              </p>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default Calendar;