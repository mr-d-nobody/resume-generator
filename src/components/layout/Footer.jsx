import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
            &copy; {new Date().getFullYear()} Resume Generator. All rights reserved.
          </div>
          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/help">Help</Link><Link to="/contact">Contact</Link></nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
