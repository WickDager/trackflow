import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ShipmentStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getStatusColor(status: ShipmentStatus): { bg: string; text: string; dot: string; border: string } {
  const colors: Record<ShipmentStatus, { bg: string; text: string; dot: string; border: string }> = {
    delivered: {
      bg: "bg-status-green-bg",
      text: "text-status-green",
      dot: "bg-status-green",
      border: "border-status-green/10",
    },
    in_transit: {
      bg: "bg-status-blue-bg",
      text: "text-status-blue",
      dot: "bg-status-blue",
      border: "border-status-blue/10",
    },
    pending: {
      bg: "bg-status-amber-bg",
      text: "text-status-amber",
      dot: "bg-status-amber",
      border: "border-status-amber/10",
    },
    failed: {
      bg: "bg-status-red-bg",
      text: "text-status-red",
      dot: "bg-status-red",
      border: "border-status-red/10",
    },
  };
  return colors[status];
}

export function getStatusLabel(status: ShipmentStatus): string {
  const labels: Record<ShipmentStatus, string> = {
    pending: 'Pending',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    failed: 'Failed',
  };
  return labels[status];
}

export function timeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }

  return formatDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
