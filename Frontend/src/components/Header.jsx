import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>Task Tracker</h1>
        </Link>
        
        <nav className="nav">
          {user ? (
            <div className="user-nav">
              <span className="user-email">{user.email}</span>
              <Button 
                onClick={onLogout}
                className="logout-btn"
                variant="outline"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="login-link">
                <Button variant="text">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
      <style jsx>{`
        .header {
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 1rem 0;
          margin-bottom: 2rem;
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          text-decoration: none;
          color: #333;
        }
        
        .logo h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .nav {
          display: flex;
          align-items: center;
        }
        
        .user-nav {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-email {
          font-size: 0.9rem;
          color: #666;
        }
        
        .auth-links {
          display: flex;
          gap: 0.5rem;
        }
        
        .login-link {
          text-decoration: none;
        }
      `}</style>
    </header>
  );
};

export default Header;