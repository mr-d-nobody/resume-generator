import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ResumeProvider } from './contexts/ResumeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ResumeBuilder from './pages/ResumeBuilder';
import Templates from './pages/Templates';
import Download from './pages/Download';
import PrintResume from './pages/PrintResume';
import TemplateViewer from './pages/TemplateViewer';
import MagicUpload from './pages/MagicUpload';
import FindJobs from './pages/FindJobs';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Account from './pages/Account';
import ProtectedRoute from './components/auth/ProtectedRoute';

const TOOL_ROUTES_WITHOUT_FOOTER = new Set(['/builder', '/download']);

function AppLayout() {
  const location = useLocation();
  const hideFooter = TOOL_ROUTES_WITHOUT_FOOTER.has(location.pathname);

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50 transition-colors duration-300 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/magic" element={<ProtectedRoute><MagicUpload /></ProtectedRoute>} />
          <Route path="/builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
          <Route path="/download" element={<ProtectedRoute><Download /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><FindJobs /></ProtectedRoute>} />
          <Route path="/profile" element={<Navigate to="/builder" replace />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  const basename = import.meta.env.BASE_URL;
  
  return (
    <Router basename={basename === '/' ? '' : basename}>
      <AuthProvider>
        <ResumeProvider>
          <Routes>
          {/* Print/Export Route (No Navbar/Footer) */}
          <Route path="/view-template/:id" element={<TemplateViewer />} />
          <Route path="/print-resume" element={<PrintResume />} />
          
          {/* App Routes with Layout */}
          <Route path="*" element={
            <AppLayout />
          } />
          </Routes>
        </ResumeProvider>
      </AuthProvider>
      <Analytics />
    </Router>
  );
}

export default App;
