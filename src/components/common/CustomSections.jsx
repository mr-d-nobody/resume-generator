import React from 'react';
import ExternalLink from './ExternalLink';

function CustomSections({
  sections,
  headingPrefix = '',
  headingSuffix = '',
  className = 'mb-6',
  headingClassName = 'text-lg font-bold uppercase mb-4 border-b pb-1',
  headingStyle,
  listClassName = 'list-disc list-outside ml-4 space-y-1',
  itemClassName = 'text-sm',
  paragraphClassName = 'text-sm leading-relaxed',
  renderSection
}) {
  const visibleSections = (sections || [])
    .filter(section => section?.visible !== false)
    .map((section) => {
      const rawItems = Array.isArray(section?.items)
        ? section.items
        : Array.isArray(section?.content)
          ? section.content
          : String(section?.description || section?.content || '').split('\n');
      const items = rawItems
        .map((item) => String(item || '').replace(/^\s*(?:[-*•▪◦‣]|\d+[.)])\s*/, '').trim())
        .filter(Boolean);
      const links = (Array.isArray(section?.links) ? section.links : [])
        .filter(link => link?.url);
      const entries = (Array.isArray(section?.entries) ? section.entries : [])
        .filter(entry => entry?.title || entry?.description || entry?.url);

      return {
        ...section,
        title: String(section?.title || '').trim() || 'Custom Section',
        description: String(section?.description || '').trim(),
        items,
        links,
        entries
      };
    })
    .filter(section =>
      section.description || section.items.length || section.links.length || section.entries.length
    );

  if (visibleSections.length === 0) return null;

  return (
    <>
      {visibleSections.map((section, index) => {
        const { items, links, entries, title } = section;
        const key = section.id || `${title}-${index}`;
        const content = (
          <div className="space-y-2">
            {items.length > 1 ? (
              <ul className={listClassName}>
                {items.map((item, itemIndex) => (
                  <li key={itemIndex} className={itemClassName}>{item}</li>
                ))}
              </ul>
            ) : items.length === 1 ? (
              <p className={paragraphClassName}>{items[0]}</p>
            ) : null}
            {links.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {links.map((link, linkIndex) => (
                  <ExternalLink
                    key={link.id || `${link.label}-${linkIndex}`}
                    href={link.url}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {link.label || 'Profile'}
                  </ExternalLink>
                ))}
              </div>
            )}
            {entries.length > 0 && (
              <div className="space-y-1.5">
                {entries.map((entry, entryIndex) => (
                  <div
                    key={entry.id || `${entry.title}-${entryIndex}`}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 text-xs">
                      {entry.title && <span className="font-semibold">{entry.title}</span>}
                      {entry.title && entry.description && <span>: </span>}
                      {entry.description && <span>{entry.description}</span>}
                    </div>
                    {entry.url && (
                      <ExternalLink
                        href={entry.url}
                        className="shrink-0 whitespace-nowrap text-xs font-semibold text-blue-600 hover:underline"
                      >
                        {entry.linkLabel || entry.title || 'Profile'}
                      </ExternalLink>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

        if (renderSection) {
          return (
            <React.Fragment key={key}>
              {renderSection({ section, title, items, links, entries, content, index })}
            </React.Fragment>
          );
        }

        return (
          <section key={key} className={className}>
            <h2 className={headingClassName} style={headingStyle}>
              {headingPrefix}{title}{headingSuffix}
            </h2>
            {content}
          </section>
        );
      })}
    </>
  );
}

export default CustomSections;
