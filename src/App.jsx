import React, { lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ResumeProvider } from './contexts/ResumeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProtectedRoute from './components/auth/ProtectedRoute';

const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const Templates = lazy(() => import('./pages/Templates'));
const Download = lazy(() => import('./pages/Download'));
const PrintResume = lazy(() => import('./pages/PrintResume'));
const TemplateViewer = lazy(() => import('./pages/TemplateViewer'));
const MagicUpload = lazy(() => import('./pages/MagicUpload'));
const FindJobs = lazy(() => import('./pages/FindJobs'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Login = lazy(() => import('./pages/Login'));
const Account = lazy(() => import('./pages/Account'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));
const Help = lazy(() => import('./pages/Help'));
const NotFound = lazy(() => import('./pages/NotFound'));

const TOOL_ROUTES_WITHOUT_FOOTER = new Set(['/builder', '/download']);

function PageLoader() {
  return <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite"><span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /><span className="sr-only">Loading page…</span></div>;
}

function AppLayout() {
  const location = useLocation();
  const hideFooter = TOOL_ROUTES_WITHOUT_FOOTER.has(location.pathname);

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50 transition-colors duration-300 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}><Routes>
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
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes></Suspense>
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
          <Suspense fallback={<PageLoader />}><Routes>
          {/* Print/Export Route (No Navbar/Footer) */}
          <Route path="/view-template/:id" element={<TemplateViewer />} />
          <Route path="/print-resume" element={<PrintResume />} />
          
          {/* App Routes with Layout */}
          <Route path="*" element={
            <AppLayout />
          } />
          </Routes></Suspense>
        </ResumeProvider>
      </AuthProvider>
      <Analytics />
    </Router>
  );
}

export default App;
