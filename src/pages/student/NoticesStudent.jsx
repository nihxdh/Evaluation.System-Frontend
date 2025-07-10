import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, X, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import Header from '../../components/Header';
import PageBackground from '../../components/PageBackground';
import Card from '../../components/Card';

const NoticesStudent = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);

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
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const NoticeModal = ({ notice, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto overflow-hidden border border-gray-100"
      >
        {/* Header with Title and Close Button */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{notice.title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Date and Time - More Subtle */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(notice.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(notice.createdAt)}</span>
            </div>
          </div>

          {/* Notice Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
              {notice.content}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

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
        <div className="max-w-7xl mx-auto px-1">
          <div className="space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <h1 className="text-xl font-semibold text-gray-800">Notices</h1>
            </motion.div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50/50 text-red-600 px-6 py-4 rounded-lg text-sm"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
                <button onClick={() => setError('')} className="ml-auto">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {/* Notices Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {notices.map((notice, index) => (
                <motion.div
                  key={notice._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedNotice(notice)}
                >
                  <Card
                    title={notice.title}
                    className="bg-white border border-gray-900/[0.05] hover:border-gray-900/[0.1] transition-all hover:shadow-md cursor-pointer group"
                  >
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {notice.content}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(notice.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {notices.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full"
                >
                  <div className="text-center py-12 bg-white border border-gray-900/[0.05] rounded-lg">
                    <div className="p-3 bg-gray-900/[0.03] rounded-full inline-flex mb-3">
                      <Bell className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No Notices</h3>
                    <p className="text-sm text-gray-500 mt-1">No notices have been posted yet.</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Notice Modal */}
      <AnimatePresence>
        {selectedNotice && (
          <NoticeModal
            notice={selectedNotice}
            onClose={() => setSelectedNotice(null)}
          />
        )}
      </AnimatePresence>
    </PageBackground>
  );
};

export default NoticesStudent; 