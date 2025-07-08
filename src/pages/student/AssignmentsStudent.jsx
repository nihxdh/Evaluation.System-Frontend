import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, X } from 'lucide-react';
import PageBackground from '../../components/PageBackground';
import Header from '../../components/Header';

const AssignmentsStudent = () => {
  const [assignments, setAssignments] = useState([]);
  const [studentYear, setStudentYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Get student year from localStorage
    const studentData = localStorage.getItem('student');
    console.log('Student data from localStorage:', studentData);
    if (studentData) {
      try {
        const student = JSON.parse(studentData);
        console.log('Parsed student data:', student);
        if (!student || !student.year) {
          setError('Your profile is missing the year information. Please contact admin or re-register.');
          return;
        }
        setStudentYear(student.year);
      } catch (err) {
        console.error('Error parsing student data:', err);
        setError('Error loading student data. Please try logging in again.');
        // Clear invalid data
        localStorage.removeItem('student');
        localStorage.removeItem('token');
        //window.location.href = '/';
      }
    } else {
      setError('No student data found. Please log in again.');
      //window.location.href = '/';
    }
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch assignments');
      }

      const data = await response.json();
      console.log('Assignments for student year:', studentYear, ':', data);
      setAssignments(data);
      setLoading(false);
    } catch (err) {
      console.error('Assignment fetch error:', err);
      if (err.message.includes('token')) {
        localStorage.removeItem('student');
        localStorage.removeItem('token');
        //window.location.href = '/';
      } else {
        setError(err.message || 'Error fetching assignments');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('studentYear changed:', studentYear);
    if (studentYear) {
      fetchAssignments();
    }
  }, [studentYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedAssignment) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/assignments/${selectedAssignment._id}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit assignment');
      }

      await fetchAssignments();
      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSelectedFile(null);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Error submitting assignment');
    }
  };

  const downloadSubmission = async (assignmentId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/assignments/${assignmentId}/download/${fileName}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Error downloading file');
    }
  };

  const getSubmissionStatus = (assignment) => {
    if (!assignment.submitted) {
      return new Date(assignment.dueDate) < new Date()
        ? { label: 'Overdue', color: 'red' }
        : { label: 'Pending', color: 'yellow' };
    }

    return assignment.grade !== null
      ? { label: 'Graded', color: 'green' }
      : { label: 'Submitted', color: 'blue' };
  };

  const canSubmitAssignment = (assignment) => {
    return !assignment.submitted && new Date(assignment.dueDate) > new Date();
  };

  if (loading) {
    return (
      <PageBackground>
        <Header />
        <main className="pt-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </PageBackground>
    );
  }

  // Sort assignments by due date (newest first)
  const sortedAssignments = [...assignments].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <PageBackground>
      <Header />
      <main className="pt-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">My Assignments</h1>
              {studentYear && (
                <span className="text-sm text-gray-600">
                  Year: {studentYear}
                </span>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50/50 text-red-600 px-6 py-4 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="grid gap-6">
              {sortedAssignments.map((assignment) => {
                const status = getSubmissionStatus(assignment);
                return (
                  <div
                    key={assignment._id}
                    className="bg-white rounded-lg border border-gray-900/[0.05] p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-medium text-gray-800">{assignment.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium bg-${status.color}-50 text-${status.color}-700`}
                      >
                        {status.label}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div>
                        Due: {new Date(assignment.dueDate).toLocaleString()}
                      </div>
                    </div>

                    {assignment.submitted && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-700">
                            Your Submission
                          </div>
                          {assignment.fileName && (
                            <button
                              onClick={() => downloadSubmission(assignment._id, assignment.fileName)}
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </button>
                          )}
                        </div>
                        {assignment.grade !== null && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Grade:</span>
                              <span className="text-sm text-gray-600">{assignment.grade}</span>
                            </div>
                            {assignment.feedback && (
                              <div className="space-y-1">
                                <span className="text-sm font-medium text-gray-700">Feedback:</span>
                                <p className="text-sm text-gray-600">{assignment.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {canSubmitAssignment(assignment) && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowSubmitModal(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          Submit Assignment
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {assignments.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-900/[0.05] p-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-gray-900/[0.03] rounded-full mb-3">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No Assignments</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      There are no assignments for your year at the moment.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Modal */}
            {showSubmitModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-lg w-full max-w-md"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-900/[0.05]">
                    <h2 className="text-lg font-medium text-gray-800">Submit Assignment</h2>
                    <button
                      onClick={() => {
                        setShowSubmitModal(false);
                        setSelectedAssignment(null);
                        setSelectedFile(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload File
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        accept=".pdf,.doc,.docx"
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-900/[0.05] file:text-gray-700 hover:file:bg-gray-900/[0.075]"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Accepted formats: PDF, DOC, DOCX (Max 10MB)
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSubmitModal(false);
                          setSelectedAssignment(null);
                          setSelectedFile(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedFile}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>
    </PageBackground>
  );
};

export default AssignmentsStudent; 