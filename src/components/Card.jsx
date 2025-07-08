import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ title, value, icon: Icon, className = '', iconClassName = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-4 rounded-xl border
        flex items-center gap-4
        transition-all duration-300
        ${className}
      `}
    >
      <div className={`p-2 rounded-lg ${iconClassName}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
      </div>
    </motion.div>
  );
};

const Card = ({ children, title, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white rounded-xl border border-gray-100
        shadow-sm overflow-hidden
        ${className}
      `}
    >
      {title && (
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </motion.div>
  );
};

export default Card; 