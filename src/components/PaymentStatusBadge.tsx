import React from 'react';
import { cn } from '@/lib/utils';

type PaymentStatus = 'da_pagare' | 'pagato_carta' | 'pagato_contanti' | 'pagato_twint';

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
  className?: string;
}

export const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "da_pagare":
      return "bg-red-100 text-red-800";
    case "pagato_carta":
    case "pagato_contanti":
    case "pagato_twint":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getPaymentStatusText = (status: string) => {
  switch (status) {
    case "da_pagare":
      return "Da pagare";
    case "pagato_carta":
      return "Pagato con carta/Apple Pay/Google Pay";
    case "pagato_contanti":
      return "Pagato in contanti";
    case "pagato_twint":
      return "Pagato con Twint";
    default:
      return status;
  }
};

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className }) => {
  const statusColor = getPaymentStatusColor(status);
  const statusText = getPaymentStatusText(status);
  
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full inline-block",
        statusColor,
        className
      )}
    >
      {statusText}
    </span>
  );
};

export default PaymentStatusBadge; 