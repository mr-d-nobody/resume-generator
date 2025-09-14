import React from 'react';

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Resume Generator. All rights reserved.
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Built with React & Tailwind CSS
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;