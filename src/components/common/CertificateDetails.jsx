import React from 'react';
import ExternalLink from './ExternalLink';

export default function CertificateDetails({
  certificate,
  className = '',
  metaClassName = '',
  linkClassName = ''
}) {
  const metadata = [
    certificate.issuer,
    certificate.date ? `Issued: ${certificate.date}` : '',
    certificate.expirationDate ? `Expires: ${certificate.expirationDate}` : '',
    certificate.credentialId ? `Credential ID: ${certificate.credentialId}` : ''
  ].filter(Boolean);

  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-3">
        {certificate.name && <div className="min-w-0 font-bold">{certificate.name}</div>}
        {certificate.url && (
          <ExternalLink
            href={certificate.url}
            className={`${linkClassName} shrink-0 whitespace-nowrap font-semibold text-blue-600 underline underline-offset-2`}
          >
            {certificate.linkLabel || 'Verify Certificate'}
          </ExternalLink>
        )}
      </div>
      {metadata.length > 0 && <div className={metaClassName}>{metadata.join(' • ')}</div>}
      {certificate.description && <div className={metaClassName}>{certificate.description}</div>}
    </div>
  );
}
