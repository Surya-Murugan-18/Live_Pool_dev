import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircleIcon } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect back to the page the user was trying to reach, or dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const submit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';

    setErrors(nextErrors);
    setAuthError('');

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await login({ email, password, remember });
      navigate(from, { replace: true });
    } catch {
      setAuthError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panelTitle="Welcome Back"
      panelText="Sign in to manage your polls, share links with your audience, and watch results arrive live."
    >
      <div className="rounded-xl border border-line bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Welcome Back</h1>
        <p className="mt-2 text-sm text-ink-muted">Sign in to manage your polls.</p>

        {authError ? (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-lg border border-danger-100 bg-danger-50 px-4 py-3"
          >
            <AlertCircleIcon
              className="mt-0.5 h-4 w-4 shrink-0 text-danger-600"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-danger-600">{authError}</p>
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            error={errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            error={errors.password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="flex items-center gap-2.5 py-1 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-line-strong text-brand-600 focus:ring-brand-200"
            />
            Remember me
          </label>

          <Button type="submit" size="lg" fullWidth loading={loading} loadingLabel="Signing in…">
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
