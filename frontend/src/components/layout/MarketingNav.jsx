import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { buttonClasses } from '../ui/Button';
export function MarketingNav() {
    return (<header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" aria-label="LivePoll home">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="ml-2 hidden sm:block">
          <a href="#how-it-works" className="rounded px-2 py-1 text-sm font-medium text-ink-muted transition-colors duration-150 ease-swift hover:text-ink">
            
            How It Works
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/login" className={buttonClasses('ghost', 'sm')}>
            Login
          </Link>
          <Link to="/signup" className={buttonClasses('primary', 'sm')}>
            Sign Up
          </Link>
        </div>
      </div>
    </header>);
}
