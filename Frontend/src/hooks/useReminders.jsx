import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays, toKey, todayKey } from '../utils/taskUtils';

const supported = () => typeof Notification !== 'undefined';

/**
 * Counts overdue / due-today / due-tomorrow tasks and, if the user allows
 * browser notifications, shows one summary notification per day.
 * Notifications only fire while the app is open in a browser tab.
 */
export const useReminders = (tasks, meta) => {
  const [permission, setPermission] = useState(() =>
    supported() ? Notification.permission : 'unsupported'
  );

  const summary = useMemo(() => {
    const today = todayKey();
    const tomorrow = toKey(addDays(new Date(), 1));
    let overdue = 0;
    let dueToday = 0;
    let dueTomorrow = 0;

    tasks.forEach((task) => {
      const info = meta[task._id];
      if (task.completed || info?.archived || !info?.due) return;
      if (info.due < today) overdue += 1;
      else if (info.due === today) dueToday += 1;
      else if (info.due === tomorrow) dueTomorrow += 1;
    });

    return { overdue, dueToday, dueTomorrow };
  }, [tasks, meta]);

  useEffect(() => {
    if (permission !== 'granted') return;
    const { overdue, dueToday } = summary;
    if (!overdue && !dueToday) return;

    const key = `taskTracker:notified:${todayKey()}`;
    try {
      if (localStorage.getItem(key)) return;

      const parts = [];
      if (overdue) parts.push(`${overdue} overdue`);
      if (dueToday) parts.push(`${dueToday} due today`);
      new Notification('Task Tracker reminder', { body: parts.join(' · ') });
      localStorage.setItem(key, '1');
    } catch {
      /* notifications unavailable */
    }
  }, [permission, summary]);

  const enable = useCallback(async () => {
    if (!supported()) return;
    try {
      setPermission(await Notification.requestPermission());
    } catch {
      /* ignore */
    }
  }, []);

  return { summary, permission, enable };
};