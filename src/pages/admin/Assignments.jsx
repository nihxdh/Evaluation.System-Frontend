import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Download, Star } from 'lucide-react';
import Header from '../../components/Header';
import PageBackground from '../../components/PageBackground';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    targetYear: ''
  });
  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/assignments/all`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to fetch assignments');
      }

      const data = await response.json();
      // Ensure submissions array exists for each assignment
      const processedData = data.map(assignment => ({
        ...assignment,
        submissions: assignment.submissions || []
      }));
      setAssignments(processedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message === 'Failed to fetch' 
        ? 'Unable to connect to server. Please check if the server is running.'
        : err.message || 'Error loading assignments');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const url = selectedAssignment
        ? `${API_BASE_URL}/assignments/${selectedAssignment._id}`
        : `${API_BASE_URL}/assignments/upload`;

      // Validate and format the data
      if (!formData.title?.trim() || !formData.description?.trim() || !formData.dueDate || !formData.targetYear) {
        setError('Please fill in all required fields');
        return;
      }

      // Format the data for submission
      const submissionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: new Date(formData.dueDate).toISOString(),
        targetYear: formData.targetYear
      };

      const response = await fetch(url, {
        method: selectedAssignment ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save assignment');
      }

      await fetchAssignments();
      setShowAddModal(false);
      setSelectedAssignment(null);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        targetYear: ''
      });
    } catch (err) {
      console.error('Assignment submission error:', err);
      setError(err.message === 'Failed to fetch'
        ? 'Unable to connect to server. Please check if the server is running.'
        : err.message || 'Error saving assignment');
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Validate grade data
      if (!gradeData.grade) {
        throw new Error('Please enter a grade');
      }

      // Get the submission ID from the submissions array
      const submission = selectedAssignment.submissions.find(
        sub => sub.student._id === selectedSubmission.student._id
      );

      if (!submission) {
        throw new Error('Submission not found');
      }

      const response = await fetch(
        `${API_BASE_URL}/assignments/${selectedAssignment._id}/grade/${submission._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            grade: parseInt(gradeData.grade),
            feedback: gradeData.feedback || ''
          })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to grade assignment');
      }

      await fetchAssignments();
      setShowGradeModal(false);
      setSelectedAssignment(null);
      setSelectedSubmission(null);
      setGradeData({ grade: '', feedback: '' });
    } catch (err) {
      console.error('Grading error:', err);
      setError(err.message || 'Error grading assignment');
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.split('T')[0],
      targetYear: assignment.targetYear
    });
    setShowAddModal(true);
  };

  const handleGrade = (assignment, submission) => {
    setSelectedAssignment(assignment);
    setSelectedSubmission(submission);
    setGradeData({
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    });
    setShowGradeModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete assignment');
      await fetchAssignments();
    } catch (err) {
      setError('Error deleting assignment');
    }
  };

  const downloadSubmission = async (assignmentId, fileName, originalName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      // Make a GET request to fetch the file
      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/download/${fileName}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to download file');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Use the original filename if available, fallback to the stored filename
      link.download = originalName || fileName;

      // Append to document, click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup the URL object
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Error downloading file');
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

  if (error) {
    return (
      <PageBackground>
        <Header />
        <div className="flex items-center justify-center min-h-[400px] mt-24">
          <div className="text-red-600 text-center">
            <p>{error}</p>
            <button 
              onClick={fetchAssignments}
              className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
          </div>
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
              <h1 className="text-xl font-semibold text-gray-800">Assignments</h1>
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setFormData({
                    title: '',
                    description: '',
                    dueDate: '',
                    targetYear: ''
                  });
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Assignment
              </button>
            </div>

            {/* Assignments Table */}
            <div className="bg-white rounded-lg border border-gray-900/[0.05] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-900/[0.05] bg-gray-900/[0.01]">
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Title</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Target Year</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Due Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Submissions</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/[0.05]">
                  {assignments.map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-gray-900/[0.01]">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-800">{assignment.title || 'Untitled'}</div>
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {assignment.description || 'No description'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          Year {assignment.targetYear || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'No due date'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {(assignment.submissions || []).map((submission) => {
                            if (!submission || !submission.student) return null;
                            return (
                              <div
                                key={submission._id}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-800">{submission.student.name || 'Unknown Student'}</span>
                                  {submission.grade !== undefined && submission.grade !== null && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                      Grade: {submission.grade}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {submission.fileName && (
                                    <button
                                      onClick={() => downloadSubmission(assignment._id, submission.fileName, submission.originalName)}
                                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors group"
                                      title="Download Submission"
                                    >
                                      <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
                                      <span className="text-xs">Download</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleGrade(assignment, submission)}
                                    className="text-yellow-600 hover:text-yellow-800"
                                  >
                                    <Star className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {(!assignment.submissions || assignment.submissions.length === 0) && (
                            <span className="text-sm text-gray-500">No submissions yet</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setDeleteId(assignment._id); setShowDeleteModal(true); }}
                          className="text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-3 bg-gray-900/[0.03] rounded-full mb-3">
                            <Plus className="h-6 w-6 text-gray-400" />
                          </div>
                          <h3 className="text-sm font-medium text-gray-900">No Assignments</h3>
                          <p className="text-sm text-gray-500 mt-1">Add your first assignment to get started.</p>
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
                      {selectedAssignment ? 'Edit Assignment' : 'Add New Assignment'}
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
                          Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value.trim() })}
                          className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                          required
                          placeholder="Enter assignment title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                          rows={4}
                          required
                          placeholder="Enter assignment description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Year *
                        </label>
                        <select
                          value={formData.targetYear}
                          onChange={(e) => setFormData({ ...formData, targetYear: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                          required
                        >
                          <option value="">Select Year</option>
                          <option value="1st">First Year</option>
                          <option value="2nd">Second Year</option>
                          <option value="3rd">Third Year</option>
                          <option value="4th">Fourth Year</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Students of selected year will see this assignment</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Due Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                          required
                          min={new Date().toISOString().slice(0, 16)}
                        />
                        <p className="mt-1 text-xs text-gray-500">Assignment submissions will be accepted until this date and time</p>
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
                        {selectedAssignment ? 'Update' : 'Add'} Assignment
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Grade Modal */}
            {showGradeModal && selectedSubmission && selectedAssignment && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-lg w-full max-w-md"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-900/[0.05]">
                    <h2 className="text-lg font-medium text-gray-800">Grade Assignment</h2>
                    <button
                      onClick={() => setShowGradeModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleGradeSubmit} className="p-4 space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-4">
                        <p>Student: <span className="font-medium text-gray-900">
                          {selectedSubmission.student?.name || 'Unknown Student'}
                        </span></p>
                        <p>Assignment: <span className="font-medium text-gray-900">
                          {selectedAssignment.title || 'Untitled Assignment'}
                        </span></p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Grade
                          </label>
                          <input
                            type="number"
                            value={gradeData.grade}
                            onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                            required
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Feedback
                          </label>
                          <textarea
                            value={gradeData.feedback}
                            onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                            rows={4}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowGradeModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Submit Grade
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
        message="Are you sure you want to delete this assignment? This action cannot be undone."
      />
    </PageBackground>
  );
};

export default Assignments; 