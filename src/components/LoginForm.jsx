import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Shield } from 'lucide-react';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateCredentials = (name, password) => {
    if (!name.trim()) return 'Name is required';
    if (!password.trim()) return 'Password is required';
    return null;
  };

  const handleStudentLogin = async () => {
    const validationError = validateCredentials(formData.name, formData.password);
    if (validationError) {
      setError(validationError);
      return false;
    }

    try {
      console.log('Attempting student login with:', formData.name);
      
      // Set API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password
        }),
      });

      const data = await response.json();
      console.log('Student login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // Clear any existing data before storing new student session
      //localStorage.clear();
      console.log('localStorage cleared');

      // Store the new data
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAdmin', 'false');
      localStorage.setItem('name', data.student.name);
      localStorage.setItem('student', JSON.stringify(data.student));
      console.log('Stored student:', localStorage.getItem('student'));

      console.log('localStorage after storing student data:', {
        token: localStorage.getItem('token') ? 'Present' : 'Missing',
        isAdmin: localStorage.getItem('isAdmin'),
        name: localStorage.getItem('name'),
        student: localStorage.getItem('student') ? 'Present' : 'Missing'
      });

      return true;
    } catch (err) {
      console.error('Student login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      return false;
    }
  };

  const handleAdminLogin = async () => {
    const validationError = validateCredentials(formData.name, formData.password);
    if (validationError) {
      setError(validationError);
      return false;
    }

    try {
      console.log('Attempting admin login with:', formData.name);
      
      // Set API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password
        }),
      });

      const data = await response.json();
      console.log('Admin login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      //localStorage.clear();
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('name', data.name);

      return true;
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form default submission
    setIsLoading(true);
    setError('');

    try {
      let success;
      
      if (!isAdmin) {
        console.log('Starting student login process...');
        success = await handleStudentLogin();
        if (success) {
          console.log('Student login successful, navigating to profile...');
          console.log('localStorage after login:', {
            token: localStorage.getItem('token'),
            isAdmin: localStorage.getItem('isAdmin'),
            student: localStorage.getItem('student')
          });
          setTimeout(() => {
            navigate('/student/profile');
          }, 100); // 100ms delay to ensure localStorage is written
          return; // Important: return here to prevent further execution
        }
      } else {
        console.log('Starting admin login process...');
        success = await handleAdminLogin();
        if (success) {
          console.log('Admin login successful, navigating to students...');
          // Use navigate instead of window.location
          navigate('/admin/students');
          return; // Important: return here to prevent further execution
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Role Switch */}
      <div className="flex justify-center space-x-4 mb-4">
        <motion.button
          type="button" // Important: specify button type
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdmin(false)}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            !isAdmin 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <User className="w-4 h-4 mr-2" />
          Student
        </motion.button>
        <motion.button
          type="button" // Important: specify button type
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdmin(true)}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            isAdmin 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Shield className="w-4 h-4 mr-2" />
          Admin
        </motion.button>
      </div>

      <div>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white/60"
          placeholder={isAdmin ? "Admin Name" : "Student Name"}
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white/60 pr-10"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button" // Important: specify button type
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit" // Important: specify button type
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        disabled={isLoading}
        className="mt-2 w-full flex justify-center py-1.5 px-4 border border-gray-200 rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </>
        ) : `Sign in as ${isAdmin ? 'Admin' : 'Student'}`}
      </motion.button>

      {!isAdmin && (
        <div className="text-center text-xs text-gray-500 pt-2">
          New to Campus Connect?{' '}
          <Link to="/register" className="text-gray-800 hover:text-gray-600">
            Create an account
          </Link>
        </div>
      )}
    </form>
  );
};

export default LoginForm; 