'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Dashboard', icon: 'sports_tennis' },
  { href: '/league', label: 'League', icon: 'leaderboard' },
  { href: '/log', label: 'Log', icon: 'add_circle' },
  { href: '/awards', label: 'Awards', icon: 'military_tech' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-8 pt-2 bg-surface-container-lowest/80 backdrop-blur-[24px] rounded-t-[1.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.06)]">
      {tabs.map(tab => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center justify-center transition-all duration-300 ease-out ${
              isActive
                ? 'bg-primary-fixed text-primary rounded-full p-3 scale-110 -translate-y-2 shadow-lg shadow-primary-fixed/20'
                : 'text-outline p-2 hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined ${tab.icon === 'add_circle' && !isActive ? 'text-3xl' : ''}`}
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {tab.icon}
            </span>
            <span className="font-[family-name:var(--font-body)] text-[8px] font-bold uppercase tracking-widest mt-0.5">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
