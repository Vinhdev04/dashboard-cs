import React, { useState } from 'react';

interface UserAvatarProps {
  avatar?: string;
  name: string;
  className?: string;
  badgeColor?: 'rose' | 'amber' | 'emerald' | 'blue' | 'slate';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  className = 'w-8 h-8',
  badgeColor = 'blue',
}) => {
  const [imgError, setImgError] = useState(false);

  // Generate 2 clean initials from name
  const initials = (() => {
    if (!name) return 'NV';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase();
  })();

  const isUrl = avatar && (avatar.startsWith('http://') || avatar.startsWith('https://'));

  if (isUrl && !imgError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setImgError(true)}
        className={`${className} rounded-full object-cover shrink-0 border border-slate-700/80 shadow-xs`}
        referrerPolicy="no-referrer"
      />
    );
  }

  const bgMap = {
    rose: 'bg-rose-600 border-rose-400/40 text-white',
    amber: 'bg-amber-600 border-amber-400/40 text-white',
    emerald: 'bg-emerald-600 border-emerald-400/40 text-white',
    blue: 'bg-blue-600 border-blue-400/40 text-white',
    slate: 'bg-slate-700 border-slate-500/40 text-slate-200',
  };

  return (
    <div
      className={`${className} rounded-full ${bgMap[badgeColor]} font-bold flex items-center justify-center text-xs shrink-0 shadow-xs border select-none`}
      title={name}
    >
      {initials}
    </div>
  );
};
