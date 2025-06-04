import React from 'react';

interface IconProps {
  className?: string;
}

export const AttackIcon = ({ className = "w-5 h-5 inline-block mr-1" }: IconProps): React.ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M15.904 4.096a.75.75 0 00-1.061-1.06L10 7.879 5.157 3.036a.75.75 0 00-1.061 1.06L8.939 10l-4.843 4.843a.75.75 0 001.06 1.061L10 12.121l4.843 4.843a.75.75 0 001.06-1.061L11.061 10l4.843-4.843a.75.75 0 00.000-.061z" />
  </svg> 
);

export const DefenseIcon = ({ className = "w-5 h-5 inline-block mr-1" }: IconProps): React.ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10 1c1.383 0 2.671.302 3.824.862l.003.001c.062.031.124.063.185.096a.75.75 0 01-.01 1.339 10.466 10.466 0 00-7.994.001.75.75 0 01-.009-1.34c.06-.032.123-.064.185-.095L6.176 1.862C7.329 1.302 8.617 1 10 1zM3.099 4.833A5.94 5.94 0 002.75 6.5C2.75 9.902 5.818 12.5 10 12.5s7.25-2.598 7.25-6c0-.596-.071-1.174-.208-1.723A.75.75 0 0117.5 5.5c.051.21.08.424.08.642 0 2.95-2.702 5.258-6.025 5.599a.75.75 0 01-.81-.007C7.407 11.37 4.75 9.132 4.75 6.188 4.75 5.97 4.78 5.76 4.83 5.55a.75.75 0 01.719-.718z" clipRule="evenodd" />
    <path d="M10 12.5c1.085 0 2.11-.133 3.053-.381a.75.75 0 00.237-1.403 7.519 7.519 0 01-6.581-.001.75.75 0 00.237 1.403A8.98 8.98 0 0110 12.5zm0-10a8.947 8.947 0 00-4.432 1.135A.75.75 0 005.25 4.5c0 .291.022.578.063.859a7.442 7.442 0 019.374 0c.041-.28.063-.568.063-.859a.75.75 0 00-.318-1.135A8.947 8.947 0 0010 2.5z" />
  </svg> 
);

export const HealthIcon = ({ className = "w-5 h-5 inline-block mr-1" }: IconProps): React.ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682c-2.058-1.591-4.376-4.013-4.376-7.185 0-2.748 2.257-4.963 5.004-4.963 1.439 0 2.79.566 3.757 1.521A5.002 5.002 0 0115 4.052c2.748 0 4.999 2.215 4.999 4.963 0 3.172-2.318 5.594-4.376 7.185a20.779 20.779 0 01-1.162.682l-.019.01-.005.002a1.001 1.001 0 01-.89 0z" />
  </svg> 
);

export const AttackSpeedIcon = ({ className = "w-5 h-5 inline-block mr-1" }: IconProps): React.ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.22 2.72a.75.75 0 00-1.44-.002L5.89 9.03a.75.75 0 00.527 1.008l4.001.002H10a2.25 2.25 0 012.25 2.25c0 .759-.374 1.434-.968 1.86l-2.638 1.918a.75.75 0 00.936 1.264l2.638-1.918A3.752 3.752 0 0013.75 12.25a3.75 3.75 0 00-3.75-3.75h-.526l2.78-4.768z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M10 1c1.383 0 2.671.302 3.824.862l.003.001c.062.031.124.063.185.096a.75.75 0 01-.01 1.339A10.466 10.466 0 002.008 3.3a.75.75 0 01-.009-1.34c.06-.032.123-.064.185-.095L2.18 1.863C3.329 1.302 4.617 1 6 1h4zM2.75 6.5a5.94 5.94 0 01.349-1.667.75.75 0 011.25.75A4.44 4.44 0 004.25 6.5c0 2.023 1.442 3.705 3.386 4.218a.75.75 0 01.49.894c-.155.69-.064 1.43.253 2.083a.75.75 0 01-1.356.59A4.372 4.372 0 015.917 12H5.5A2.75 2.75 0 012.75 9.25V6.5z" clipRule="evenodd" />
  </svg> 
);

export const GoldIcon = ({ className = "w-5 h-5 inline-block mr-1" }: IconProps): React.ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0V8.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
  </svg> 
);

export const XPIcon = ({ className = "w-5 h-5 inline-block mr-1" }: IconProps): React.ReactNode => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
</svg> 
);

export const NextStageIcon = ({ className = "w-5 h-5 inline-block mr-1" }: IconProps): React.ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export const PreviousStageIcon = ({ className = "w-5 h-5 inline-block mr-1" }: IconProps): React.ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

export const SaveIcon = ({ className = "w-5 h-5" }: IconProps): React.ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M3 3.75A1.75 1.75 0 0 1 4.75 2h5.586c.464 0 .909.184 1.237.513l4.414 4.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0 1 15.25 18H4.75A1.75 1.75 0 0 1 3 16.25V3.75Z" />
    <path d="M9 8.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5H9.75A.75.75 0 0 1 9 8.25ZM8.25 12a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5H8.25Z" />
    <path d="M5 5.75A.75.75 0 0 0 5.75 5h2.5a.75.75 0 0 0 0-1.5h-2.5A.75.75 0 0 0 5 5.75Z" />
  </svg>
);

export const RefreshIcon = ({ className = "w-5 h-5" }: IconProps): React.ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);


export const InventoryIcon = ({ className = "w-6 h-6" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.001c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

export const WeaponSlotIcon = ({ className = "w-6 h-6" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3.75l-4.5 4.5m0 0l-4.5 4.5M9.75 8.25l4.5-4.5M9.75 8.25l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> {/* Placeholder - a sword-like X */}
  </svg>
);

export const ArmorSlotIcon = ({ className = "w-6 h-6" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /> {/* Shield Icon for Armor */}
  </svg>
);

export const ShieldSlotIcon = ({ className = "w-6 h-6" }: IconProps) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /> {/* Shield Icon - Info, but good placeholder */}
  </svg>
);

export const AccessorySlotIcon = ({ className = "w-6 h-6" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 9H11.25A3.375 3.375 0 007.5 12.375V18.75m9 0h-9" /> {/* Ring-like */}
  </svg>
);

export const SellIcon = ({ className = "w-5 h-5" }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);
