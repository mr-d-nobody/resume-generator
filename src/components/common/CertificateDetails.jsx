import React from 'react';
import ExternalLink from './ExternalLink';
import { asString, normalizeUrl } from '../../utils/resumeData';

export default function CertificateDetails({
  certificate,
  className = '',
  metaClassName = '',
  linkClassName = ''
}) {
  const name = asString(certificate?.name);
  const issuer = asString(certificate?.issuer);
  const date = asString(certificate?.date);
  const expirationDate = asString(certificate?.expirationDate);
  const credentialId = asString(certificate?.credentialId);
  const description = asString(certificate?.description);
  const url = normalizeUrl(certificate?.url);
  const metadata = [
    issuer,
    date ? `Issued: ${date}` : '',
    expirationDate ? `Expires: ${expirationDate}` : '',
    credentialId ? `Credential ID: ${credentialId}` : ''
  ].filter(Boolean);

  if (![name, ...metadata, description, url].some(Boolean)) return null;

  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-3">
        {name && <div className="min-w-0 font-bold">{name}</div>}
        {url && (
          <ExternalLink
            href={url}
            className={`${linkClassName} shrink-0 whitespace-nowrap font-semibold text-blue-600 underline underline-offset-2`}
          >
            {asString(certificate?.linkLabel) || 'Verify Certificate'}
          </ExternalLink>
        )}
      </div>
      {metadata.length > 0 && <div className={metaClassName}>{metadata.join(' • ')}</div>}
      {description && <div className={metaClassName}>{description}</div>}
    </div>
  );
}
