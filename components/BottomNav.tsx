import Link from 'next/link';
import { MapIcon, ChartIcon, GiftIcon } from './icons';

const TABS = [
  { href: '/', label: 'מסע', Icon: MapIcon },
  { href: '/status', label: 'המצב שלי', Icon: ChartIcon },
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
