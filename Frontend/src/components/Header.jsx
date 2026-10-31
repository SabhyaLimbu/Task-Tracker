import { Link, NavLink } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';

const Header = ({ user, onLogout }) => {
  const { displayName, initials } = useProfile(user);

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-left">
          <Link to="/" className="site-logo">Task Tracker</Link>
          <nav className="main-nav" aria-label="Main">
            <NavLink to="/" end>Tasks</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </nav>
        </div>

        <div className="header-right">
          <Link to="/profile" className="header-profile" title={user?.email}>
            <span className="avatar avatar-sm">{initials}</span>
            <span className="header-user">{displayName}</span>
          </Link>
          <button type="button" className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;