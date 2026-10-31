import { useMemo } from 'react';
import { isDueToday, isOverdue } from '../utils/taskUtils';

const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const StatsCards = ({ tasks, meta = {} }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    const overdue = tasks.filter((t) => isOverdue(t, meta[t._id])).length;
    const dueToday = tasks.filter((t) => isDueToday(t, meta[t._id])).length;
    const highPriority = tasks.filter(
      (t) => !t.completed && meta[t._id]?.priority === 'high'
    ).length;

    // Tasks created per day for the last 7 days (needs createdAt from the API)
    const today = startOfDay(Date.now());
    const week = Array.from({ length: 7 }, (_, i) => {
      const day = today - (6 - i) * DAY;
      return {
        day,
        label: new Date(day).toLocaleDateString(undefined, { weekday: 'short' }),
        count: 0,
      };
    });

    let hasDates = false;
    tasks.forEach((task) => {
      if (!task.createdAt) return;
      hasDates = true;
      const bucket = week.find((w) => w.day === startOfDay(task.createdAt));
      if (bucket) bucket.count += 1;
    });

    const max = Math.max(1, ...week.map((w) => w.count));
    return { total, completed, pending, rate, overdue, dueToday, highPriority, week, hasDates, max };
  }, [tasks, meta]);

  const tiles = [
    { label: 'Total', value: stats.total },
    { label: 'Completed', value: stats.completed },
    { label: 'Pending', value: stats.pending },
    { label: 'Completion', value: `${stats.rate}%` },
    { label: 'Overdue', value: stats.overdue, warn: stats.overdue > 0 },
    { label: 'Due today', value: stats.dueToday },
  ];

  return (
    <section className="stats-panel" aria-label="Task statistics">
      <h2 className="panel-title">Overview</h2>

      <div className="stat-grid">
        {tiles.map((tile) => (
          <div className={`stat-card${tile.warn ? ' warn' : ''}`} key={tile.label}>
            <span className="stat-label">{tile.label}</span>
            <strong className="stat-value">{tile.value}</strong>
          </div>
        ))}
      </div>

      <div className="progress" role="progressbar" aria-valuenow={stats.rate}
        aria-valuemin={0} aria-valuemax={100} aria-label="Completion progress">
        <div className="progress-fill" style={{ width: `${stats.rate}%` }} />
      </div>

      {stats.highPriority > 0 && (
        <p className="stat-note">
          {stats.highPriority} high-priority task{stats.highPriority > 1 ? 's' : ''} still open
        </p>
      )}

      {stats.hasDates && (
        <div className="week-chart">
          <span className="stat-label">Tasks added, last 7 days</span>
          <div className="week-bars">
            {stats.week.map((w) => (
              <div className="week-col" key={w.day}>
                <span className="week-count">{w.count || ''}</span>
                <div
                  className="week-bar"
                  style={{ height: `${(w.count / stats.max) * 100}%` }}
                />
                <span className="week-label">{w.label.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default StatsCards;