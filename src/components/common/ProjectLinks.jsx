import React from 'react';
import ExternalLink from './ExternalLink';
import { normalizeProjectLinks } from '../../utils/resumeData';

export default function ProjectLinks({
  project,
  containerClassName = 'flex flex-wrap gap-2',
  linkClassName = 'text-xs font-semibold text-blue-600 hover:underline',
  prefix = '',
  suffix = ''
}) {
  const links = normalizeProjectLinks(project);
  if (links.length === 0) return null;

  return (
    <div className={containerClassName}>
      {links.map((link) => (
        <ExternalLink key={link.id} href={link.url} className={linkClassName}>
          {prefix}{link.label}{suffix}
        </ExternalLink>
      ))}
    </div>
  );
}
