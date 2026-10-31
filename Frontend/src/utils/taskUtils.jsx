export const PRIORITIES = ['low', 'medium', 'high'];

export const PRIORITY_LABEL = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export const NEXT_PRIORITY = { low: 'medium', medium: 'high', high: 'low' };

export const REPEAT_LABEL = {
  none: 'No repeat',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const pad = (n) => String(n).padStart(2, '0');

/** Date -> YYYY-MM-DD in local time (matches <input type="date">). */
export const toKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayKey = () => toKey(new Date());

/** YYYY-MM-DD -> local Date at midnight. */
export const parseKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const step = (date, repeat) => {
  const d = new Date(date);
  if (repeat === 'daily') {
    d.setDate(d.getDate() + 1);
  } else if (repeat === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else {
    // monthly: keep the day of month, clamped to the length of the next month
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, last));
  }
  return d;
};

/** Next due date for a recurring task; always lands after today. */
export const nextDueDate = (due, repeat) => {
  let next = step(due ? parseKey(due) : new Date(), repeat);
  const today = todayKey();
  for (let i = 0; i < 1000 && toKey(next) <= today; i += 1) {
    next = step(next, repeat);
  }
  return toKey(next);
};

export const isOverdue = (task, info) =>
  !task.completed && !!info?.due && info.due < todayKey();

export const isDueToday = (task, info) =>
  !task.completed && !!info?.due && info.due === todayKey();

export const matchesDueFilter = (task, info, filter) => {
  if (filter === 'any') return true;
  const due = info?.due;
  if (filter === 'none') return !due;
  if (!due) return false;

  const today = todayKey();
  if (filter === 'overdue') return !task.completed && due < today;
  if (filter === 'today') return due === today;
  if (filter === 'week') return due >= today && due <= toKey(addDays(new Date(), 7));
  return true;
};

/** Counts used by the sidebar. Archived tasks are kept out of the live counts. */
export const computeCounts = (tasks, meta = {}) => {
  let archived = 0;
  let completed = 0;
  let live = 0;
  tasks.forEach((task) => {
    if (meta[task._id]?.archived) {
      archived += 1;
    } else {
      live += 1;
      if (task.completed) completed += 1;
    }
  });
  return { all: live, active: live - completed, completed, archived };
};