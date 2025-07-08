import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/LoginForm';
import PageBackground from '../components/PageBackground';

const Login = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: { 
      scale: 1.05,
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <PageBackground>
      <AnimatePresence>
        <motion.div 
          className="min-h-screen flex items-center justify-center p-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="w-full max-w-sm"
            variants={itemVariants}
          >
            {/* Logo and welcome text */}
            <div className="text-center mb-6">
              <motion.div
                className="flex items-center justify-center gap-3"
                variants={itemVariants}
              >
                <motion.div
                  className="p-2 rounded-full bg-white/80 shadow-sm cursor-pointer"
                  variants={logoVariants}
                  whileHover="hover"
                >
                  <svg 
                    className="w-6 h-6 text-gray-700" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </motion.div>
                <motion.h1
                  variants={itemVariants}
                  className="text-2xl font-semibold text-gray-800"
                >
                  Campus Connect
                </motion.h1>
              </motion.div>
            </div>

            {/* Login form card */}
            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <LoginForm />
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </PageBackground>
  );
};

export default Login; 