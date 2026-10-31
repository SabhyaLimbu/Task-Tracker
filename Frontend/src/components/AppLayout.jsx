import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Icon from './Icon';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../hooks/useTheme';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const AppLayout = ({ user, onLogout, counts, children }) => {
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();
  const { displayName, initials } = useProfile(user);
  const { theme, toggleTheme } = useTheme();

  // Close the mobile sidebar after navigating
  useEffect(() => {
    setOpen(false);
  }, [pathname, search]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="shell">
      <Sidebar
        user={user}
        onLogout={onLogout}
        counts={counts}
        open={open}
        onClose={() => setOpen(false)}
      />
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <div className="shell-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="round-btn menu-btn"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <div>
              <p className="topbar-greeting">
                {greeting()}, {displayName}
              </p>
              <p className="topbar-date">{today}</p>
            </div>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="round-btn"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              onClick={toggleTheme}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
            <Link to="/profile" className="avatar avatar-sm" aria-label="Profile">
              {initials}
            </Link>
          </div>
        </header>

        <main className="page">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;