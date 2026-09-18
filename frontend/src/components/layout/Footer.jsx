import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
export function Footer() {
    return (<footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-ink-muted">Create. Share. Vote. Live.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
          <a href="#how-it-works" className="text-ink-muted transition-colors duration-150 ease-swift hover:text-ink">
            How It Works
          </a>
          <Link to="/login" className="text-ink-muted transition-colors duration-150 ease-swift hover:text-ink">
            Login
          </Link>
          <Link to="/signup" className="text-ink-muted transition-colors duration-150 ease-swift hover:text-ink">
            Sign Up
          </Link>
        </nav>
      </div>
    </footer>);
}
