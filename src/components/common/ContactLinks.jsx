import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Link as LinkIcon } from 'lucide-react';
import ExternalLink from './ExternalLink';
import { normalizeResumeLinks } from '../../utils/resumeData';

export default function ContactLinks({ 
  personal, 
  containerClass = "flex flex-wrap gap-4 text-sm text-gray-600",
  itemClass = "flex items-center gap-1",
  linkClass = "hover:underline",
  iconSize = 14,
  separator = null,
  showIcons = true,
  formatGithub = false,
  style
}) {
  if (!personal) return null;

  const links = [];

  if (personal.email) {
    links.push(
      <span key="email" className={itemClass}>
        {showIcons && <Mail size={iconSize} />}
        <a href={`mailto:${personal.email}`} className={linkClass}>{personal.email}</a>
      </span>
    );
  }

  if (personal.phone) {
    links.push(
      <span key="phone" className={itemClass}>
        {showIcons && <Phone size={iconSize} />}
        <a href={`tel:${personal.phone.replace(/[^0-9+]/g, '')}`} className={linkClass}>{personal.phone}</a>
      </span>
    );
  }

  if (personal.location) {
    links.push(
      <span key="location" className={itemClass}>
        {showIcons && <MapPin size={iconSize} />}
        {personal.location}
      </span>
    );
  }

  normalizeResumeLinks(personal).forEach((link) => {
    const label = link.label.toLowerCase();
    const Icon = label === 'linkedin'
      ? Linkedin
      : label === 'github'
        ? Github
        : label === 'website'
          ? Globe
          : LinkIcon;
    const displayLabel = formatGithub && label === 'github'
      ? link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
      : link.label;
    links.push(
      <span key={link.id} className={itemClass}>
        {showIcons && <Icon size={iconSize} />}
        <ExternalLink href={link.url} className={linkClass}>{displayLabel}</ExternalLink>
      </span>
    );
  });

  return (
    <div className={containerClass} style={style}>
      {links.map((link, index) => (
        <React.Fragment key={link.key}>
          {link}
          {separator && index < links.length - 1 && <span>{separator}</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
