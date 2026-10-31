import { useCallback, useEffect, useState } from 'react';

const storageKey = (user) =>
  `taskTracker:order:${user?.email || user?._id || 'guest'}`;

const read = (user) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(user)));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Manual (drag-and-drop) task order, saved in this browser. */
export const useTaskOrder = (user) => {
  const [order, setOrder] = useState(() => read(user));

  useEffect(() => {
    setOrder(read(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?._id]);

  const saveOrder = useCallback(
    (ids) => {
      setOrder(ids);
      try {
        localStorage.setItem(storageKey(user), JSON.stringify(ids));
      } catch {
        /* storage unavailable: keep in memory only */
      }
    },
    [user]
  );

  return { order, saveOrder };
};

/** Sort tasks by the saved order; tasks not in it keep their place at the end. */
export const applyOrder = (tasks, order) => {
  const rank = new Map(order.map((id, index) => [id, index]));
  return tasks
    .map((task, index) => ({
      task,
      rank: rank.has(task._id) ? rank.get(task._id) : order.length + index,
    }))
    .sort((a, b) => a.rank - b.rank)
    .map((item) => item.task);
};