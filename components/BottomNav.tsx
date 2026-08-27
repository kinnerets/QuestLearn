import Link from 'next/link';
import { MapIcon, GridIcon, GiftIcon } from './icons';

const TABS = [
  { href: '/', label: 'מסע', Icon: MapIcon },
  { href: '/map', label: 'נושאים', Icon: GridIcon },
  { href: '/shop', label: 'חנות', Icon: GiftIcon },
] as const;

export function BottomNav({ active = '/' }: { active?: string }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className={`nav-item${active === href ? ' on' : ''}`}>
          <Icon />
          {label}
        </Link>
      ))}
    </nav>
  );
}
