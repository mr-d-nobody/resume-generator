import React from 'react';
import { formatDateRange } from '../../utils/resumeData';

export default function DateRange({ startDate, endDate, ...props }) {
  const value = formatDateRange(startDate, endDate);
  return value ? <span {...props}>{value}</span> : null;
}
