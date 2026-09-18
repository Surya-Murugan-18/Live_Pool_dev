import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CalendarIcon,
  CameraIcon,
  MailIcon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppNav } from '../components/layout/AppNav';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/LoadingSkeleton';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/api';
import { usePolls } from '../contexts/PollsContext';
import { totalVotes } from '../utils/poll';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Reads a File and returns a base64 data-URI resized to maxSide × maxSide
 * using an off-screen canvas. The output is always JPEG at 88 % quality
 * which keeps the payload well under the 200 KB backend limit.
 */
function resizeToDataURL(file, maxSide = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        // Fill white so JPEG has no transparency artefacts
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// AvatarUploader sub-component
// ---------------------------------------------------------------------------

function AvatarUploader({ user, onSaved }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null); // data-URI while editing
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Current photo: preview while editing → saved avatarUrl → null (show initials)
  const currentSrc = preview ?? user?.avatarUrl ?? null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Please choose a JPEG, PNG, WebP or GIF image.');
      return;
    }

    try {
      const dataUrl = await resizeToDataURL(file, 256);
      setPreview(dataUrl);
    } catch {
      toast.error('Could not read the image file.');
    }

    // Reset input so the same file can be re-selected after a cancel
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      const updated = await authApi.updateAvatar({ avatarUrl: preview });
      onSaved(updated);
      setPreview(null);
      toast.success('Profile photo updated.');
    } catch (err) {
      toast.error(err.message || 'Could not save photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const updated = await authApi.updateAvatar({ avatarUrl: '' });
      onSaved(updated);
      setPreview(null);
      toast.success('Profile photo removed.');
    } catch (err) {
      toast.error(err.message || 'Could not remove photo.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar with camera overlay */}
      <div className="group relative inline-block">
        {currentSrc ? (
          <img
            src={currentSrc}
            alt={user?.name ?? 'Profile photo'}
            className="h-24 w-24 rounded-full border-2 border-line object-cover shadow-card"
          />
        ) : (
          <Avatar
            initials={getInitials(user?.name ?? '')}
            name={user?.name ?? ''}
            className="h-24 w-24 text-2xl"
          />
        )}

        {/* Click-overlay button — hidden until hover */}
        <button
          type="button"
          aria-label="Change profile photo"
          onClick={() => fileRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/40 opacity-0 transition-opacity duration-150 ease-swift group-hover:opacity-100 focus-visible:opacity-100"
        >
          <CameraIcon className="h-6 w-6 text-white drop-shadow" aria-hidden="true" />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Upload profile photo"
        />
      </div>

      {/* Action buttons — only shown when a new photo is staged */}
      {preview ? (
        <div className="flex w-full gap-2">
          <Button
            size="sm"
            fullWidth
            loading={uploading}
            loadingLabel="Saving…"
            onClick={handleSave}
          >
            Save photo
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
            onClick={handleCancel}
            disabled={uploading}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-ink shadow-card transition-colors duration-150 ease-swift hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700"
          >
            <CameraIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {currentSrc ? 'Change photo' : 'Upload photo'}
          </button>

          {/* Remove button — only when a saved photo exists */}
          {user?.avatarUrl ? (
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              loading={removing}
              loadingLabel="Removing…"
              onClick={handleRemove}
              className="text-danger-600 hover:bg-danger-50 hover:text-danger-700"
            >
              <Trash2Icon className="h-3.5 w-3.5" aria-hidden="true" />
              Remove photo
            </Button>
          ) : null}
        </div>
      )}

      <p className="text-center text-[11px] text-ink-subtle">
        JPEG · PNG · WebP · GIF — max 5 MB
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile page
// ---------------------------------------------------------------------------

export function Profile() {
  const { user, updateUser } = useAuth();
  const { polls } = usePolls();

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setNameInput(user.name);
  }, [user?.name]);

  const stats = React.useMemo(() => {
    const active = polls.filter((p) => p.status === 'active').length;
    const closed = polls.filter((p) => p.status === 'closed').length;
    const allVotes = polls.reduce((sum, p) => sum + totalVotes(p.options), 0);
    return { total: polls.length, active, closed, votes: allVotes };
  }, [polls]);

  const handleSaveName = async (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError('Name cannot be empty.'); return; }
    if (trimmed === user?.name) { setEditing(false); return; }
    setSaving(true);
    setNameError('');
    try {
      const updated = await authApi.updateProfile({ name: trimmed });
      updateUser(updated);
      toast.success('Display name updated.');
      setEditing(false);
    } catch (err) {
      setNameError(err.message || 'Could not update name.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setNameInput(user?.name ?? '');
    setNameError('');
    setEditing(false);
  };

  const isLoading = !user;

  return (
    <div className="flex min-h-full w-full flex-col bg-canvas">
      <AppNav />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-2 text-[15px] text-ink-muted">
            Your account details and activity at a glance.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* ---------------------------------------------------------------- */}
          {/* Left column — photo + name */}
          {/* ---------------------------------------------------------------- */}
          <div className="space-y-5">
            <Card className="flex flex-col items-center gap-5 text-center">
              {isLoading ? (
                <>
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-48" />
                </>
              ) : (
                <>
                  {/* Photo uploader */}
                  <AvatarUploader user={user} onSaved={updateUser} />

                  <div className="w-full border-t border-line pt-4">
                    <p className="text-lg font-extrabold tracking-tight text-ink">
                      {user.name}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-muted">{user.email}</p>
                  </div>

                  {/* Edit-name form */}
                  {editing ? (
                    <form onSubmit={handleSaveName} className="w-full space-y-3">
                      <Input
                        label="Display name"
                        value={nameInput}
                        error={nameError}
                        autoFocus
                        onChange={(e) => setNameInput(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" fullWidth loading={saving} loadingLabel="Saving…">
                          Save
                        </Button>
                        <Button type="button" variant="secondary" size="sm" fullWidth onClick={cancelEdit} disabled={saving}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => setEditing(true)} className="w-full">
                      <PencilIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit Name
                    </Button>
                  )}
                </>
              )}
            </Card>

            {/* Activity stats */}
            <Card>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                Activity
              </h2>
              {isLoading ? (
                <div className="mt-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
                </div>
              ) : (
                <dl className="mt-4 space-y-3">
                  {[
                    { label: 'Total polls',     value: stats.total  },
                    { label: 'Active polls',    value: stats.active },
                    { label: 'Closed polls',    value: stats.closed },
                    { label: 'Votes collected', value: stats.votes  },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <dt className="text-sm text-ink-muted">{label}</dt>
                      <dd className="text-sm font-bold tabular-nums text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Card>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Right column — account info + poll table */}
          {/* ---------------------------------------------------------------- */}
          <div className="space-y-5">
            <Card>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                Account Information
              </h2>

              {isLoading ? (
                <div className="mt-5 space-y-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <dl className="mt-5 divide-y divide-line">
                  {/* Full name */}
                  <div className="flex items-start gap-3 pb-5">
                    <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-medium text-ink-muted">Full name</dt>
                      <dd className="mt-0.5 truncate text-sm font-semibold text-ink">{user.name}</dd>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="shrink-0 text-xs font-semibold text-brand-600 transition-colors duration-150 ease-swift hover:text-brand-700"
                      aria-label="Edit display name"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3 py-5">
                    <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-medium text-ink-muted">Email address</dt>
                      <dd className="mt-0.5 truncate text-sm font-semibold text-ink">{user.email}</dd>
                    </div>
                    <span className="shrink-0 rounded-full bg-live-50 px-2 py-0.5 text-[11px] font-bold text-live-700">
                      Verified
                    </span>
                  </div>

                  {/* Member since */}
                  <div className="flex items-start gap-3 pt-5">
                    <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-medium text-ink-muted">Member since</dt>
                      <dd className="mt-0.5 text-sm font-semibold text-ink">{formatDate(user.createdAt)}</dd>
                    </div>
                  </div>
                </dl>
              )}
            </Card>

            {/* Poll summary table */}
            <Card padded={false}>
              <div className="px-5 py-4 sm:px-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                  Poll Summary
                </h2>
              </div>

              {isLoading ? (
                <div className="space-y-3 border-t border-line px-5 py-5 sm:px-6">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)}
                </div>
              ) : polls.length === 0 ? (
                <div className="border-t border-line px-5 py-8 text-center sm:px-6">
                  <p className="text-sm text-ink-muted">No polls created yet.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-line bg-canvas">
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-ink-subtle sm:px-6">
                        Question
                      </th>
                      <th className="px-3 py-3 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-ink-subtle">
                        Votes
                      </th>
                      <th className="px-3 py-3 pr-5 text-right text-[11px] font-bold uppercase tracking-[0.1em] text-ink-subtle sm:pr-6">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {polls.slice(0, 8).map((poll) => (
                      <tr key={poll.id} className="transition-colors duration-100 hover:bg-canvas/60">
                        <td className="max-w-[240px] truncate px-5 py-3 font-medium text-ink sm:px-6">
                          {poll.question}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-ink-muted">
                          {totalVotes(poll.options)}
                        </td>
                        <td className="px-3 py-3 pr-5 text-right sm:pr-6">
                          <span
                            className={
                              poll.status === 'active'
                                ? 'inline-block rounded-full bg-live-50 px-2 py-0.5 text-[11px] font-bold text-live-700'
                                : 'inline-block rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] font-bold text-ink-subtle'
                            }
                          >
                            {poll.status === 'active' ? 'Active' : 'Closed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
