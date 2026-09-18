import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {
  ChevronDownIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { useAuth } from '../../contexts/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/polls', label: 'My Polls' },
  { to: '/create', label: 'Create Poll' },
];

function linkClasses(isActive) {
  return twMerge(
    'rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150 ease-swift',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-muted hover:bg-canvas hover:text-ink'
  );
}

/** Derive initials from a full name string. */
function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function AppNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user?.name ?? 'Account';
  const displayInitials = initials(displayName);

  const menuItems = [
    {
      label: 'Profile',
      icon: <UserIcon className="h-4 w-4" aria-hidden="true" />,
      onSelect: () => navigate('/profile'),
    },
    {
      label: 'Settings',
      icon: <SettingsIcon className="h-4 w-4" aria-hidden="true" />,
      onSelect: () => navigate('/settings'),
    },
    {
      label: 'Logout',
      icon: <LogOutIcon className="h-4 w-4" aria-hidden="true" />,
      tone: 'danger',
      onSelect: () => {
        logout();
        navigate('/login');
        toast.success('You have been signed out.');
      },
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/dashboard" aria-label="LivePoll dashboard">
          <Logo />
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => linkClasses(isActive)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Dropdown
            label="Account menu"
            items={menuItems}
            trigger={({ open }) => (
              <span
                className={twMerge(
                  'flex items-center gap-2 rounded-lg border border-line px-2 py-1.5 transition-colors duration-150 ease-swift hover:bg-canvas',
                  open ? 'bg-canvas' : 'bg-white'
                )}
              >
                <Avatar initials={displayInitials} name={displayName} size="sm" />
                <span className="hidden text-sm font-semibold text-ink sm:block">
                  {displayName}
                </span>
                <ChevronDownIcon
                  className={twMerge(
                    'h-4 w-4 text-ink-subtle transition-transform duration-150 ease-swift',
                    open ? 'rotate-180' : ''
                  )}
                  aria-hidden="true"
                />
              </span>
            )}
          />

          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors duration-150 ease-swift hover:bg-canvas md:hidden"
          >
            {mobileOpen ? (
              <XIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <MenuIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden border-t border-line bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 p-3">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    twMerge(linkClasses(isActive), 'py-3 text-base')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
