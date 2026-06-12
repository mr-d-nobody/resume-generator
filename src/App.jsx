import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ResumeProvider } from './contexts/ResumeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ResumeBuilder from './pages/ResumeBuilder';
import Templates from './pages/Templates';
import Download from './pages/Download';
import TemplateViewer from './pages/TemplateViewer';

function App() {
  const basename = import.meta.env.BASE_URL;
  
  return (
    <ResumeProvider>
      <Router basename={basename === '/' ? '' : basename}>
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
                  <Route path="/builder" element={<ResumeBuilder />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/download" element={<Download />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </ResumeProvider>
  );
}

export default App;
