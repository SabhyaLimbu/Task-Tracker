import { useState } from 'react';

const RemindersBanner = ({ summary, permission, onEnable }) => {
  const [hidden, setHidden] = useState(false);
  const { overdue, dueToday, dueTomorrow } = summary;

  if (hidden || (!overdue && !dueToday && !dueTomorrow)) return null;

  const parts = [];
  if (overdue) parts.push(`${overdue} overdue`);
  if (dueToday) parts.push(`${dueToday} due today`);
  if (dueTomorrow) parts.push(`${dueTomorrow} due tomorrow`);

  return (
    <div className={`reminder-banner${overdue ? ' alert' : ''}`} role="status">
      <p className="reminder-text">
        <strong>Reminders:</strong> {parts.join(' · ')}
      </p>
      <div className="reminder-actions">
        {permission === 'default' && (
          <button type="button" className="reminder-btn" onClick={onEnable}>
            Enable notifications
          </button>
        )}
        <button type="button" className="link-btn" onClick={() => setHidden(true)}>
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default RemindersBanner;