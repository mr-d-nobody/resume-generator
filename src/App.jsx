import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ResumeProvider } from './contexts/ResumeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ResumeBuilder from './pages/ResumeBuilder';
import Templates from './pages/Templates';
import Download from './pages/Download';
import TemplateViewer from './pages/TemplateViewer';
import MagicUpload from './pages/MagicUpload';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Account from './pages/Account';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const basename = import.meta.env.BASE_URL;
  
  return (
    <Router basename={basename === '/' ? '' : basename}>
      <AuthProvider>
        <ResumeProvider>
          <Routes>
          {/* Print/Export Route (No Navbar/Footer) */}
          <Route path="/view-template/:id" element={<TemplateViewer />} />
          
          {/* App Routes with Layout */}
          <Route path="*" element={
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/magic" element={<ProtectedRoute><MagicUpload /></ProtectedRoute>} />
                  <Route path="/builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
                  <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
                  <Route path="/download" element={<ProtectedRoute><Download /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
          </Routes>
        </ResumeProvider>
      </AuthProvider>
      <Analytics />
    </Router>
  );
}

export default App;
