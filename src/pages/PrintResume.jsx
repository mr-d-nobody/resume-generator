import React from 'react';
import ResumePreview from '../components/preview/ResumePreview';

export default function PrintResume() {
  return (
    <div className="min-h-screen bg-white text-gray-950">
      <ResumePreview outputMode="print" />
    </div>
  );
}
