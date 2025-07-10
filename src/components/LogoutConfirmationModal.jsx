import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

const LogoutConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="absolute inset-0 bg-gray-900/30"
          onClick={onCancel}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-lg shadow-lg max-w-sm w-full mx-auto overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gray-800 flex items-center justify-between shadow-sm">
            <h3 className="text-sm font-medium text-white">Logout</h3>
            <button
              onClick={onCancel}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4 text-gray-300" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to logout?
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={onCancel}
                className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-3 py-2 text-sm text-white bg-gray-700 hover:bg-gray-800 rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LogoutConfirmationModal; 