import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    try {
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser);
        } else {
          // Clear invalid user data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.token || !data.user) {
        console.error('Missing token or user in response:', data);
        throw new Error('Invalid response data from server');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      navigate('/');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { 
        success: false, 
        message: error.message || 'An error occurred during login' 
      };
    }
  };

  const signup = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // If the registration is successful, automatically log the user in
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/');
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: error.message || 'An error occurred during signup' 
      };
    }
  };

  const googleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleLogin, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
