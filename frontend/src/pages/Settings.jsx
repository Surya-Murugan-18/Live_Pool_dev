import React, { useState } from 'react';
import {
  AlertTriangleIcon,
  BellIcon,
  KeyRoundIcon,
  LogOutIcon,
  ShieldIcon,
  Trash2Icon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AppNav } from '../components/layout/AppNav';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/api';

// ---------------------------------------------------------------------------
// Section header helper
// ---------------------------------------------------------------------------
function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Change Password section
// ---------------------------------------------------------------------------
function ChangePasswordSection() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrent('');
    setNext('');
    setConfirm('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!current) errs.current = 'Enter your current password.';
    if (next.length < 8) errs.next = 'New password must be at least 8 characters.';
    if (next !== confirm) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      await authApi.changePassword({ current, new: next });
      toast.success('Password changed successfully.');
      reset();
    } catch (err) {
      // Map the specific error to the right field
      if (err.message?.toLowerCase().includes('current')) {
        setErrors({ current: err.message });
      } else {
        toast.error(err.message || 'Could not change password.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <SectionHeading
        icon={KeyRoundIcon}
        title="Change Password"
        description="Use a strong, unique password you don't use anywhere else."
      />

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <PasswordInput
          label="Current password"
          autoComplete="current-password"
          placeholder="Enter your current password"
          value={current}
          error={errors.current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <PasswordInput
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={next}
          error={errors.next}
          hint="At least 8 characters."
          onChange={(e) => setNext(e.target.value)}
        />
        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          value={confirm}
          error={errors.confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" size="md" loading={saving} loadingLabel="Saving…">
            Update Password
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={reset}
            disabled={saving}
          >
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Notification preferences section (UI-only, extensible)
// ---------------------------------------------------------------------------
function NotificationSection() {
  const [prefs, setPrefs] = useState({
    pollClosed: true,
    voteMilestone: false,
    productUpdates: true,
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const items = [
    {
      key: 'pollClosed',
      label: 'Poll closed',
      description: 'Get notified when one of your polls is closed.',
    },
    {
      key: 'voteMilestone',
      label: 'Vote milestones',
      description: 'Notify me when a poll reaches 50, 100, or 500 votes.',
    },
    {
      key: 'productUpdates',
      label: 'Product updates',
      description: 'Occasional emails about new LivePoll features.',
    },
  ];

  return (
    <Card>
      <SectionHeading
        icon={BellIcon}
        title="Notification Preferences"
        description="Choose what you want to hear about."
      />

      <ul className="mt-6 divide-y divide-line">
        {items.map(({ key, label, description }) => (
          <li key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
            </div>
            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={prefs[key]}
              aria-label={label}
              onClick={() => toggle(key)}
              className={[
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-swift focus:outline-none focus:ring-4 focus:ring-brand-100',
                prefs[key] ? 'bg-brand-600' : 'bg-line-strong',
              ].join(' ')}
            >
              <span
                className={[
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-card ring-0 transition-transform duration-200 ease-swift',
                  prefs[key] ? 'translate-x-5' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-4 border-t border-line">
        <Button
          size="sm"
          onClick={() => toast.success('Notification preferences saved.')}
        >
          Save Preferences
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Security section — sessions
// ---------------------------------------------------------------------------
function SecuritySection() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOutAll = async () => {
    setSigningOut(true);
    // In a production app this would hit an endpoint to invalidate all tokens.
    // For now it clears the local session and redirects to login.
    await new Promise((r) => setTimeout(r, 600));
    logout();
    navigate('/login');
    toast.success('Signed out of all sessions.');
  };

  return (
    <Card>
      <SectionHeading
        icon={ShieldIcon}
        title="Security"
        description="Manage active sessions and account access."
      />

      <div className="mt-6 rounded-lg border border-line bg-canvas px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">Current session</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              This browser — signed in via JWT token.
            </p>
          </div>
          <span className="mt-0.5 shrink-0 rounded-full bg-live-50 px-2 py-0.5 text-[11px] font-bold text-live-700">
            Active
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          size="sm"
          loading={signingOut}
          loadingLabel="Signing out…"
          onClick={handleSignOutAll}
        >
          <LogOutIcon className="h-4 w-4" aria-hidden="true" />
          Sign out of all sessions
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Danger zone — delete account
// ---------------------------------------------------------------------------
function DangerZoneSection() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const openModal = () => {
    setPassword('');
    setPwError('');
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!password) {
      setPwError('Password is required to confirm deletion.');
      return;
    }
    setDeleting(true);
    setPwError('');
    try {
      await authApi.deleteAccount({ password });
      toast.success('Account deleted. Goodbye!');
      logout();
      navigate('/');
    } catch (err) {
      if (err.message?.toLowerCase().includes('password') || err.message?.toLowerCase().includes('incorrect')) {
        setPwError(err.message);
      } else {
        toast.error(err.message || 'Could not delete account.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-danger-100">
        <SectionHeading
          icon={AlertTriangleIcon}
          title="Danger Zone"
          description="These actions are permanent and cannot be undone."
        />

        <div className="mt-6 rounded-lg border border-danger-100 bg-danger-50 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Delete account</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Permanently removes your account, all polls, and all collected votes.
                This cannot be reversed.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              className="shrink-0"
              onClick={openModal}
            >
              <Trash2Icon className="h-4 w-4" aria-hidden="true" />
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation modal */}
      <Modal
        open={deleteOpen}
        title="Delete your account?"
        description="This will permanently delete your account, all polls you've created, and all vote data. This action cannot be undone."
        onClose={deleting ? undefined : () => setDeleteOpen(false)}
        icon={
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-50 text-danger-600">
            <Trash2Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="bg-danger-500 hover:bg-danger-600"
              onClick={handleDelete}
              loading={deleting}
              loadingLabel="Deleting…"
            >
              Yes, delete my account
            </Button>
          </>
        }
      >
        <PasswordInput
          label="Enter your password to confirm"
          placeholder="Your current password"
          value={password}
          error={pwError}
          autoComplete="current-password"
          onChange={(e) => {
            setPassword(e.target.value);
            if (pwError) setPwError('');
          }}
        />
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Settings page
// ---------------------------------------------------------------------------
export function Settings() {
  return (
    <div className="flex min-h-full w-full flex-col bg-canvas">
      <AppNav />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        {/* Page header */}
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 text-[15px] text-ink-muted">
            Manage your password, notifications, and account security.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <ChangePasswordSection />
          <NotificationSection />
          <SecuritySection />
          <DangerZoneSection />
        </div>
      </main>
    </div>
  );
}
