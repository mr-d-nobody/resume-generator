import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Menu, UserCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import resumeLogo from '../../assets/resume-logo.svg';

/**
 * Navigation bar component
 * Provides navigation links
 */
function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/magic', label: 'Magic Upload ✨' },
    { path: '/builder', label: 'Manual Entry / Edit' },
    { path: '/templates', label: 'Templates' },
    { path: '/download', label: 'Download' },
    { path: '/profile', label: 'Profile' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navPath = (path) => (
    isAuthenticated || path === '/'
      ? path
      : `/signup?next=${encodeURIComponent(path)}`
  );

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      closeMenu();
      navigate('/', { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="flex items-center space-x-2 text-xl font-bold text-primary-600 dark:text-primary-400">
            <img src={resumeLogo} alt="Resume Builder Logo" className="h-8 w-8" />
            <span>ResumeBuilder</span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden xl:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={navPath(link.path)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!isLoading && (
              isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link to="/account" className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:text-gray-200">
                    <UserCircle className="h-5 w-5" />
                    {user.firstName || 'Account'}
                  </Link>
                  <button onClick={handleLogout} disabled={isSigningOut} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200">
                    <LogIn className="h-4 w-4" /> Sign in
                  </Link>
                  <Link to="/signup" className="btn-primary text-sm">Get started</Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center gap-2">
            {!isLoading && (
              isAuthenticated ? (
                <>
                  <Link to="/account" className="hidden items-center gap-2 rounded-lg border border-gray-600 px-3 py-2 text-sm font-semibold text-white sm:inline-flex">
                    <UserCircle className="h-4 w-4" />
                    {user.firstName || 'Account'}
                  </Link>
                  <button onClick={handleLogout} disabled={isSigningOut} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-lg px-2 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 dark:text-white">Login</Link>
                  <Link to="/signup" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Sign up</Link>
                </>
              )
            )}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="xl:hidden shadow-lg border-t border-gray-100 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={navPath(link.path)}
                  onClick={closeMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!isLoading && (
                isAuthenticated ? (
                  <div className="space-y-1 border-t border-gray-200 pt-2 dark:border-gray-700">
                    <Link to="/account" onClick={closeMenu} className="block rounded-md px-3 py-2 text-base font-medium text-blue-600">
                      Account · {user.firstName || user.email}
                    </Link>
                    <button onClick={handleLogout} disabled={isSigningOut} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" onClick={closeMenu} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300">Sign in</Link>
                    <Link to="/signup" onClick={closeMenu} className="block rounded-md bg-blue-600 px-3 py-2 text-base font-medium text-white">Create account</Link>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
