import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Check, Cloud, CloudUpload, Loader2, LogIn, LogOut, Menu, UserCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useResume } from '../../contexts/ResumeContext';
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
  const {
    cloudStatus,
    cloudError,
    cloudConflict,
    useCloudVersion,
    keepLocalVersion
  } = useResume();

  const cloudIndicator = isAuthenticated ? {
    loading: { icon: Loader2, label: 'Loading resume', className: 'text-blue-500', spin: true },
    saving: { icon: CloudUpload, label: 'Saving to cloud', className: 'text-blue-500', spin: false },
    saved: { icon: Check, label: 'Saved to cloud', className: 'text-emerald-500', spin: false },
    conflict: { icon: AlertCircle, label: 'Save conflict', className: 'text-amber-500', spin: false },
    error: { icon: AlertCircle, label: cloudError || 'Cloud save failed', className: 'text-red-500', spin: false },
    idle: { icon: Cloud, label: 'Cloud ready', className: 'text-gray-400', spin: false }
  }[cloudStatus] : null;
  const CloudIcon = cloudIndicator?.icon;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/magic', label: 'Magic Upload ✨' },
    { path: '/builder', label: 'Manual Entry / Edit' },
    { path: '/templates', label: 'Templates' },
    { path: '/jobs', label: 'Find Jobs' }
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="flex min-w-0 max-w-[58vw] items-center space-x-2 text-xl font-bold text-primary-600 dark:text-primary-400 sm:max-w-none">
            <img src={resumeLogo} alt="Resume Builder Logo" className="h-8 w-8 shrink-0" />
            <span className="truncate">ResumeBuilder</span>
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
            {cloudIndicator && (
              <div
                className={`flex items-center gap-1.5 text-xs font-medium ${cloudIndicator.className}`}
                title={cloudIndicator.label}
                aria-label={cloudIndicator.label}
              >
                <CloudIcon className={`h-4 w-4 ${cloudIndicator.spin ? 'animate-spin' : ''}`} />
                <span>{cloudIndicator.label === 'Saving to cloud' ? 'Saving…' : cloudIndicator.label === 'Saved to cloud' ? 'Saved' : ''}</span>
              </div>
            )}
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
          <div className="xl:hidden flex items-center gap-1.5 sm:gap-2">
            {cloudIndicator && (
              <span title={cloudIndicator.label} aria-label={cloudIndicator.label} className={cloudIndicator.className}>
                <CloudIcon className={`h-5 w-5 ${cloudIndicator.spin ? 'animate-spin' : ''}`} />
              </span>
            )}
            {!isLoading && (
              isAuthenticated ? (
                <>
                  <Link to="/account" className="hidden items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600 sm:inline-flex dark:border-gray-600 dark:text-white">
                    <UserCircle className="h-4 w-4" />
                    {user.firstName || 'Account'}
                  </Link>
                  <button onClick={handleLogout} disabled={isSigningOut} className="hidden items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:inline-flex">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden rounded-lg px-2 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 dark:text-white sm:inline-flex">Login</Link>
                  <Link to="/signup" className="hidden rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:inline-flex">Sign up</Link>
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
      {cloudConflict && (
        <div className="border-t border-amber-300 bg-amber-50 px-4 py-2 text-amber-950 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-100">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <span>A newer resume was saved from another device. Which version should be kept?</span>
            <button
              type="button"
              onClick={useCloudVersion}
              className="rounded-md bg-white px-3 py-1.5 font-semibold shadow-sm ring-1 ring-amber-300 hover:bg-amber-100 dark:bg-gray-900 dark:ring-amber-700"
            >
              Use cloud version
            </button>
            <button
              type="button"
              onClick={keepLocalVersion}
              className="rounded-md bg-amber-600 px-3 py-1.5 font-semibold text-white hover:bg-amber-700"
            >
              Keep my changes
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
