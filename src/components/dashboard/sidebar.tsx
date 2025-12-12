'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useSidebar } from './sidebar-context';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: 'ph-house' },
  { label: 'New Brief', href: '/dashboard/new', icon: 'ph-plus-circle' },
  { label: 'My Briefs', href: '/dashboard/briefs', icon: 'ph-files' },
  { label: 'Sage AI', href: '/dashboard/sage', icon: 'ph-sparkle' },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Settings', href: '/dashboard/settings', icon: 'ph-gear' },
  { label: 'Billing', href: '/dashboard/billing', icon: 'ph-credit-card' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link href="/dashboard" className="sidebar-logo">
          {isCollapsed ? (
            <Image
              src="/Logo/Logo-mark-solo.svg"
              alt="Prereq"
              width={24}
              height={24}
              priority
            />
          ) : (
            <Image
              src="/Logo/Logo-full.svg"
              alt="Prereq"
              width={100}
              height={32}
              priority
            />
          )}
        </Link>
        <button
          className="sidebar-collapse-btn"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`ph ${isCollapsed ? 'ph-sidebar-simple' : 'ph-sidebar-simple'}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <i className={`ph ${item.icon}`}></i>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-nav-section">
          {secondaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive(item.href) ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <i className={`ph ${item.icon}`}></i>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'sidebar-avatar'
              }
            }}
          />
          {!isCollapsed && <span className="sidebar-user-label">Account</span>}
        </div>
      </div>
    </aside>
  );
}
