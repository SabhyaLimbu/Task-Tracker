import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import { useProfile } from '../hooks/useProfile';

const NAV = [
  { label: 'Dashboard', to: '/', view: 'all', icon: 'dashboard', count: 'all' },
  { label: 'Active', to: '/?view=active', view: 'active', icon: 'active', count: 'active' },
  { label: 'Completed', to: '/?view=completed', view: 'completed', icon: 'completed', count: 'completed' },
  { label: 'Profile', to: '/profile', icon: 'profile' },
];

const Sidebar = ({ user, onLogout, counts, open, onClose }) => {
  const { pathname, search } = useLocation();
  const view = new URLSearchParams(search).get('view') || 'all';
  const { displayName, initials } = useProfile(user);

  const rate = counts?.all ? Math.round((counts.completed / counts.all) * 100) : 0;

  const isActive = (item) =>
    item.to === '/profile'
      ? pathname === '/profile'
      : pathname === '/' && view === item.view;

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <Link to="/" className="brand" onClick={onClose}>
        <span className="brand-mark">✓</span>
        <span className="brand-name">Task Tracker</span>
      </Link>

      <nav className="side-nav" aria-label="Main">
        <span className="side-heading">Menu</span>
        {NAV.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`side-link${isActive(item) ? ' active' : ''}`}
            onClick={onClose}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.count && counts && (
              <span className="side-count">{counts[item.count]}</span>
            )}
          </Link>
        ))}
      </nav>

      {counts && (
        <div className="side-progress">
          <div className="side-progress-top">
            <span>Today's progress</span>
            <strong>{rate}%</strong>
          </div>
          <div className="progress" role="progressbar" aria-valuenow={rate}
            aria-valuemin={0} aria-valuemax={100} aria-label="Overall progress">
            <div className="progress-fill" style={{ width: `${rate}%` }} />
          </div>
          <span className="side-progress-note">
            {counts.completed} of {counts.all} tasks done
          </span>
        </div>
      )}

      <div className="side-bottom">
        <Link to="/profile" className="side-user" onClick={onClose}>
          <span className="avatar avatar-sm">{initials}</span>
          <span className="side-user-text">
            <strong>{displayName}</strong>
            <small>{user?.email}</small>
          </span>
        </Link>
        <button type="button" className="side-logout" onClick={onLogout}>
          <Icon name="logout" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;