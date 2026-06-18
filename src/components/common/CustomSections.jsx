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
  paragraphClassName = 'text-sm leading-relaxed'
}) {
  const visibleSections = (sections || []).filter(section => (
    section?.title?.trim() || section?.description?.trim() || section?.items?.length
  ));

  if (visibleSections.length === 0) return null;

  return (
    <>
      {visibleSections.map((section, index) => {
        const items = Array.isArray(section.items)
          ? section.items.filter(Boolean)
          : (section.description || '').split('\n').filter(Boolean);
        const title = section.title || 'Custom Section';

        return (
          <section key={section.id || `${title}-${index}`} className={className}>
            <h2 className={headingClassName} style={headingStyle}>
              {headingPrefix}{title}{headingSuffix}
            </h2>
            {items.length > 1 ? (
              <ul className={listClassName}>
                {items.map((item, itemIndex) => (
                  <li key={itemIndex} className={itemClassName}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className={paragraphClassName}>{items[0] || section.description}</p>
            )}
          </section>
        );
      })}
    </>
  );
}

export default CustomSections;
