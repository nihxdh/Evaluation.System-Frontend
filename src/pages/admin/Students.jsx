import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';
import Header from '../../components/Header';
import PageBackground from '../../components/PageBackground';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    year: '1st',
    password: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedStudent) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await axios.put(
          `http://localhost:5000/api/admin/students/${selectedStudent._id}`,
          updateData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/students',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchStudents();
      setShowAddModal(false);
      setSelectedStudent(null);
      setFormData({
        name: '',
        email: '',
        year: '1st',
        password: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student');
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      year: student.year,
      password: ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/admin/students/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // Refresh the students list after successful deletion
        await fetchStudents();
      } else {
        throw new Error('Failed to delete student');
      }
    } catch (err) {
      console.error('Delete student error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to delete student. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[400px] mt-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900/10"></div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground>
      <Header />
      <main className="pt-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">Students</h1>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setFormData({
                    name: '',
                    email: '',
                    year: '1st',
                    password: ''
                  });
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </button>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg border border-gray-900/[0.05] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-900/[0.05] bg-gray-900/[0.01]">
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Email</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Year</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/[0.05]">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-900/[0.01]">
                      <td className="px-6 py-4 text-sm text-gray-800">{student.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.year}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setDeleteId(student._id); setShowDeleteModal(true); }}
                          className="text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {students.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-3 bg-gray-900/[0.03] rounded-full mb-3">
                            <Plus className="h-6 w-6 text-gray-400" />
                          </div>
                          <h3 className="text-sm font-medium text-gray-900">No Students</h3>
                          <p className="text-sm text-gray-500 mt-1">Add your first student to get started.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-lg w-full max-w-md"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-900/[0.05]">
                    <h2 className="text-lg font-medium text-gray-800">
                      {selectedStudent ? 'Edit Student' : 'Add New Student'}
                    </h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <select
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                          required
                        >
                          <option value="1st">1st Year</option>
                          <option value="2nd">2nd Year</option>
                          <option value="3rd">3rd Year</option>
                          <option value="4th">4th Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {selectedStudent ? 'New Password (leave empty to keep current)' : 'Password'}
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                          required={!selectedStudent}
                          minLength={6}
                          placeholder={selectedStudent ? 'Leave empty to keep current password' : 'Enter password (min. 6 characters)'}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {selectedStudent ? 'Update' : 'Add'} Student
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50/50 text-red-600 px-6 py-4 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <DeleteConfirmationModal
        open={showDeleteModal}
        onCancel={() => { setShowDeleteModal(false); setDeleteId(null); }}
        onConfirm={async () => {
          await handleDelete(deleteId);
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        message="Are you sure you want to delete this student? This action cannot be undone."
      />
    </PageBackground>
  );
};

export default Students; 