import { useCallback, useEffect, useState } from 'react';

const storageKey = (user) =>
  `taskTracker:meta:${user?.email || user?._id || 'guest'}`;

const read = (user) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(user))) || {};
  } catch {
    return {};
  }
};

/**
 * Extra per-task details (priority, due date) kept in this browser, keyed by
 * task id. No backend changes needed. When your API supports these fields,
 * move them into the task itself and delete this hook.
 */
export const useTaskMeta = (user) => {
  const [meta, setMeta] = useState(() => read(user));

  useEffect(() => {
    setMeta(read(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?._id]);

  const save = useCallback(
    (next) => {
      try {
        localStorage.setItem(storageKey(user), JSON.stringify(next));
      } catch {
        /* storage unavailable: keep in memory only */
      }
    },
    [user]
  );

  const setTaskMeta = useCallback(
    (id, changes) => {
      setMeta((current) => {
        const next = { ...current, [id]: { ...current[id], ...changes } };
        save(next);
        return next;
      });
    },
    [save]
  );

  const removeTaskMeta = useCallback(
    (ids) => {
      const list = Array.isArray(ids) ? ids : [ids];
      setMeta((current) => {
        const next = { ...current };
        list.forEach((id) => delete next[id]);
        save(next);
        return next;
      });
    },
    [save]
  );

  return { meta, setTaskMeta, removeTaskMeta };
};