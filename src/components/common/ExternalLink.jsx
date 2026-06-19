import React from 'react';
import { normalizeUrl } from '../../utils/resumeData';

export default function ExternalLink({ href, children, ...props }) {
  const normalizedHref = normalizeUrl(href);
  if (!normalizedHref) return null;

  return (
    <a
      href={normalizedHref}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}
