import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Layout, Download } from 'lucide-react';
import resumeLogo from '../assets/resume-logo.svg';

/**
 * Home page component
 * Landing page with hero, features, and call-to-action
 */
function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <img src={resumeLogo} alt="Resume Builder Logo" className="h-24 w-24" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Create Professional Resumes in Minutes
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Use our intuitive resume builder with modern templates to land your dream job.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/builder"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white text-base font-medium hover:bg-blue-700 transition"
            >
              Start Building
            </Link>
            <Link
              to="/templates"
              className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-base font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              View Templates
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          <div className="flex flex-col items-center text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
            <img src={resumeLogo} alt="Resume Builder Logo" className="h-10 w-10 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Easy to Use</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Build resumes effortlessly with our intuitive editor.
            </p>
          </div>

          <div className="flex flex-col items-center text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
            <Layout className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Modern Templates</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Choose from a variety of ATS-friendly professional designs.
            </p>
          </div>

          <div className="flex flex-col items-center text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
            <Download className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Export Ready</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Download resumes instantly in PDF format.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to create your standout resume?
          </h2>
          <Link
            to="/builder"
            className="inline-block px-8 py-3 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition"
          >
            Build Your Resume Now
          </Link>
        </section>
      </div>
    </div>
  );
}

export default Home;
