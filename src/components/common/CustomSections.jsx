import React from 'react';

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

      return {
        ...section,
        title: String(section?.title || '').trim() || 'Custom Section',
        description: String(section?.description || '').trim(),
        items
      };
    })
    .filter(section => section.description || section.items.length);

  if (visibleSections.length === 0) return null;

  return (
    <>
      {visibleSections.map((section, index) => {
        const { items, title } = section;
        const key = section.id || `${title}-${index}`;
        const content = items.length > 1 ? (
          <ul className={listClassName}>
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className={itemClassName}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className={paragraphClassName}>{items[0] || section.description}</p>
        );

        if (renderSection) {
          return (
            <React.Fragment key={key}>
              {renderSection({ section, title, items, content, index })}
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
