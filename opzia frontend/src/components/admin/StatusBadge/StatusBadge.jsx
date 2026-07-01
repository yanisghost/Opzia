// src/components/admin/StatusBadge/StatusBadge.jsx
// Thin wrapper around Badge that maps backend order status strings
// directly to badge colour variants. Handles capitalisation.

import React from 'react';
import Badge from '@components/ui/Badge/Badge';

const STATUS_VARIANT_MAP = {
  pending:   'pending',
  confirmed: 'confirmed',
  shipped:   'shipped',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

function StatusBadge({ status }) {
  const variant = STATUS_VARIANT_MAP[status?.toLowerCase()] || 'neutral';
  return <Badge variant={variant}>{status}</Badge>;
}

export default StatusBadge;
