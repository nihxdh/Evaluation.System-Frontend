import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, GraduationCap, FileText, Calendar } from 'lucide-react';
import axios from 'axios';
import Header from '../../components/Header';
import PageBackground from '../../components/PageBackground';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Profile mounted');
    console.log('localStorage at mount:', {
      token: localStorage.getItem('token'),
      isAdmin: localStorage.getItem('isAdmin'),
      student: localStorage.getItem('student')
    });
    fetchProfileAndAssignments();
  }, []);

  const fetchProfileAndAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const studentData = localStorage.getItem('student');
      
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Student data:', studentData ? 'Present' : 'Missing');
      
      if (!token || !studentData) {
        throw new Error('Authentication required. Please login again.');
      }

      let student;
      try {
        student = JSON.parse(studentData);
      } catch (e) {
        throw new Error('Invalid student data');
      }
      if (!student || typeof student !== 'object' || !student.name || !student.email) {
        throw new Error('Invalid student data');
      }

      // Set API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log('Using API URL:', apiUrl);

      // Set headers for all requests
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      };
      
      console.log('Fetching profile from:', `${apiUrl}/student/profile`);
      
      // Fetch student profile
      const profileResponse = await fetch(`${apiUrl}/student/profile`, {
        headers
      });

      console.log('Profile response status:', profileResponse.status);

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        console.error('Profile error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      console.log('Profile data received:', profileData);
      
      // Update token if server sent a refreshed one
      const newToken = profileResponse.headers.get('New-Access-Token');
      if (newToken) {
        localStorage.setItem('token', newToken);
        console.log('Token refreshed');
      }
      setProfile(profileData);

      console.log('Fetching assignments from:', `${apiUrl}/assignments`);
      
      // Fetch student's assignments
      const assignmentsResponse = await fetch(`${apiUrl}/assignments`, {
        headers
      });

      console.log('Assignments response status:', assignmentsResponse.status);

      if (!assignmentsResponse.ok) {
        const errorData = await assignmentsResponse.json();
        console.error('Assignments error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch assignments');
      }

      const assignmentsData = await assignmentsResponse.json();
      console.log('Assignments data received:', assignmentsData);
      
      // Update token if refreshed during assignments fetch
      const newTokenAssignments = assignmentsResponse.headers.get('New-Access-Token');
      if (newTokenAssignments) {
        localStorage.setItem('token', newTokenAssignments);
        console.log('Token refreshed during assignments fetch');
      }
      setAssignments(assignmentsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err.message || 'Failed to fetch data';
      setError(errorMessage);
      
      // Only logout for authentication errors, not network errors
      if (errorMessage.includes('Authentication required') || errorMessage.includes('Invalid token')) {
        console.log('Authentication error detected, logging out...');
        localStorage.removeItem('student');
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('name');
       // Optionally redirect to login
       // window.location.href = '/';
      }
      
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <PageBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[400px] mt-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageBackground>
    );
  }

  if (error) {
    return (
      <PageBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[400px] mt-24">
          <div className="text-red-600">{error}</div>
        </div>
      </PageBackground>
    );
  }

  // Don't render if profile is not loaded
  if (!profile) {
    return (
      <PageBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[400px] mt-24">
          <div className="text-gray-600">Loading profile...</div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <Header />
      <div className="max-w-7xl mx-auto px-1 pt-32 pb-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-gray-900/[0.05] overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-900/[0.05]">
            <h2 className="text-xl font-semibold text-gray-800">Student Profile</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-900/[0.02] rounded-lg">
                  <User className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="text-sm font-medium text-gray-900">{profile.name || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-900/[0.02] rounded-lg">
                  <Mail className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-sm font-medium text-gray-900">{profile.email || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-900/[0.02] rounded-lg">
                  <GraduationCap className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Year</div>
                  <div className="text-sm font-medium text-gray-900">Year {profile.year || 'Not Set'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Section */}
        <div className="bg-white rounded-xl border border-gray-900/[0.05] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-900/[0.05] flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">My Assignments</h2>
            <span className="text-sm text-gray-500">Year {profile.year || 'All'} Assignments</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900/[0.02] border-b border-gray-900/[0.05]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">Assignment</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/[0.05]">
                {assignments && assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <motion.tr
                      key={assignment._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-900/[0.01]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-900/[0.02] rounded-lg">
                            <FileText className="h-4 w-4 text-gray-700" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{assignment.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{assignment.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{formatDate(assignment.dueDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assignment.submitted 
                            ? 'bg-green-100 text-green-800' 
                            : new Date(assignment.dueDate) < new Date()
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assignment.submitted 
                            ? 'Submitted' 
                            : new Date(assignment.dueDate) < new Date()
                              ? 'Overdue'
                              : 'Pending'
                          }
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">
                      No assignments found for your year
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default Profile; 