import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

export default function ContactLinks({ 
  personal, 
  containerClass = "flex flex-wrap gap-4 text-sm text-gray-600",
  itemClass = "flex items-center gap-1",
  linkClass = "hover:underline",
  iconSize = 14,
  separator = null,
  showIcons = true,
  formatGithub = false
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

  if (personal.linkedin) {
    links.push(
      <span key="linkedin" className={itemClass}>
        {showIcons && <Linkedin size={iconSize} />}
        <a href={personal.linkedin} target="_blank" rel="noreferrer" className={linkClass}>LinkedIn</a>
      </span>
    );
  }

  if (personal.github) {
    const displayGithub = formatGithub ? `github.com/${personal.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}` : 'GitHub';
    links.push(
      <span key="github" className={itemClass}>
        {showIcons && <Github size={iconSize} />}
        <a href={personal.github} target="_blank" rel="noreferrer" className={linkClass}>{displayGithub}</a>
      </span>
    );
  }

  if (personal.website) {
    links.push(
      <span key="website" className={itemClass}>
        {showIcons && <Globe size={iconSize} />}
        <a href={personal.website} target="_blank" rel="noreferrer" className={linkClass}>Website</a>
      </span>
    );
  }

  return (
    <div className={containerClass}>
      {links.map((link, index) => (
        <React.Fragment key={link.key}>
          {link}
          {separator && index < links.length - 1 && <span>{separator}</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
