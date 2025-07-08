import React from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, LogOut, LayoutDashboard, Users, FileText, Bell } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const userName = localStorage.getItem('name');

  const adminNavItems = [
    { icon: Users, label: 'Students', path: '/admin/students' },
    { icon: FileText, label: 'Assignments', path: '/admin/assignments' },
    { icon: Bell, label: 'Notices', path: '/admin/notices' },
  ];

  const studentNavItems = [
    { icon: FileText, label: 'Assignments', path: '/student/assignments' },
    { icon: Bell, label: 'Notices', path: '/student/notices' },
    { icon: Users, label: 'Profile', path: '/student/profile' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col">
          {/* Top Bar with Logo and User Info */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/[0.08] rounded-xl">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                Campus Connect
              </span>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-white/[0.08] rounded-lg">
                <span className="text-sm font-medium text-white/95">
                  {userName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center px-6 h-12 bg-gray-800/95 border-b border-white/[0.08]">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-all rounded-md ${
                    isActive
                      ? 'bg-white/[0.12] text-white'
                      : 'text-white/80 hover:bg-white/[0.08] hover:text-white'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 