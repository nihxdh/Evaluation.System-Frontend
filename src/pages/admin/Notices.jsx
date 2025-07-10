import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import Header from '../../components/Header';
import PageBackground from '../../components/PageBackground';
import Card from '../../components/Card';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notices');
      }

      const data = await response.json();
      setNotices(data);
    } catch (err) {
      setError('Error loading notices');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingNotice
        ? `${import.meta.env.VITE_API_URL}/notices/${editingNotice._id}`
        : `${import.meta.env.VITE_API_URL}/notices/create`;

      const response = await fetch(url, {
        method: editingNotice ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(editingNotice ? 'Failed to update notice' : 'Failed to create notice');
      }

      const data = await response.json();
      
      if (editingNotice) {
        setNotices(notices.map(notice => 
          notice._id === editingNotice._id ? data : notice
        ));
      } else {
        setNotices([data, ...notices]);
      }

      setIsModalOpen(false);
      setEditingNotice(null);
      setFormData({ title: '', content: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (noticeId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notices/${noticeId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (!response.ok) {
        throw new Error('Failed to delete notice');
      }
      setNotices(notices.filter(notice => notice._id !== noticeId));
    } catch (err) {
      setError('Error deleting notice');
      console.error(err);
    }
  };

  const openEditModal = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content
    });
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
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
        <div className="max-w-7xl mx-auto px-1">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">Notices</h1>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditingNotice(null);
                  setFormData({ title: '', content: '' });
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Notice
              </motion.button>
            </div>

            {/* Notices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notices.map((notice) => (
                <Card
                  key={notice._id}
                  title={notice.title}
                  className="bg-white border border-gray-900/[0.05] hover:border-gray-900/[0.1] transition-colors"
                >
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {notice.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(notice.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(notice)}
                          className="p-1 hover:text-gray-900 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setDeleteId(notice._id); setShowDeleteModal(true); }}
                          className="p-1 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {notices.length === 0 && (
                <div className="col-span-full">
                  <div className="text-center py-12 bg-white border border-gray-900/[0.05] rounded-lg">
                    <div className="p-3 bg-gray-900/[0.03] rounded-full inline-flex mb-3">
                      <X className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No Notices</h3>
                    <p className="text-sm text-gray-500 mt-1">Create your first notice to get started.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-lg w-full max-w-md"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-900/[0.05]">
                    <h2 className="text-lg font-medium text-gray-800">
                      {editingNotice ? 'Edit Notice' : 'Create Notice'}
                    </h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        rows={4}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-900/[0.05] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/[0.05]"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : editingNotice ? 'Update' : 'Create'}
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
        message="Are you sure you want to delete this notice? This action cannot be undone."
      />
    </PageBackground>
  );
};

export default Notices; 