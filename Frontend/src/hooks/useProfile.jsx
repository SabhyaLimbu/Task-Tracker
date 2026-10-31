import { useCallback, useEffect, useState } from 'react';

const storageKey = (user) =>
  `taskTracker:profile:${user?.email || user?._id || 'guest'}`;

const fallbackName = (user) =>
  user?.name ||
  user?.username ||
  (user?.email ? user.email.split('@')[0] : 'User');

const read = (user) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(user))) || {};
  } catch {
    return {};
  }
};

/**
 * Profile details (display name, bio) saved per user in this browser.
 * No backend changes needed. Swap saveProfile for an API call later if you
 * add a profile endpoint.
 */
export const useProfile = (user) => {
  const [stored, setStored] = useState(() => read(user));

  useEffect(() => {
    setStored(read(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?._id]);

  const saveProfile = useCallback(
    (changes) => {
      const next = { ...read(user), ...changes };
      try {
        localStorage.setItem(storageKey(user), JSON.stringify(next));
      } catch {
        /* storage unavailable: keep in memory only */
      }
      setStored(next);
    },
    [user]
  );

  const displayName = stored.displayName?.trim() || fallbackName(user);
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';

  return { displayName, bio: stored.bio || '', initials, saveProfile };
};