import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args) => twMerge(clsx(args));

const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-11 w-11 text-base' };

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// Deterministic color from name
const bgColors = [
  'bg-icon-bg-green text-icon-green',
  'bg-icon-bg-blue text-icon-blue',
  'bg-icon-bg-purple text-icon-purple',
  'bg-icon-bg-orange text-icon-orange',
  'bg-icon-bg-pink text-icon-pink',
  'bg-icon-bg-teal text-icon-teal',
];

function colorFor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return bgColors[Math.abs(hash) % bgColors.length];
}

export default function Avatar({ name, src, size = 'md', className }) {
  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold overflow-hidden', sizes[size], !src && colorFor(name), className)}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
