import React from 'react';
import { LockIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

/**
 * Confirm dialog shown before closing a poll.
 *
 * Props:
 *   open        – whether the modal is visible
 *   question    – poll question shown as a preview
 *   onCancel    – called when the user dismisses without confirming
 *   onConfirm   – called when the user clicks "Close Poll"
 *   loading     – (optional) when provided the parent controls the loading state;
 *                 if omitted the modal manages it internally with a short delay
 */
export function ClosePollModal({ open, question, onCancel, onConfirm, loading: externalLoading }) {
  // When the parent passes a loading prop, use it; otherwise manage internally
  const [internalLoading, setInternalLoading] = React.useState(false);
  const isControlled = externalLoading !== undefined;
  const closing = isControlled ? externalLoading : internalLoading;

  const confirm = () => {
    if (isControlled) {
      // Parent handles the async operation and its loading state
      onConfirm();
    } else {
      // Legacy: fire onConfirm immediately, show a brief spinner locally
      setInternalLoading(true);
      window.setTimeout(() => {
        setInternalLoading(false);
        onConfirm();
      }, 550);
    }
  };

  return (
    <Modal
      open={open}
      title="Close this poll?"
      description="Once closed, participants will no longer be able to submit new votes. Final results stay available to everyone with the link."
      onClose={closing ? () => undefined : onCancel}
      icon={
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-50 text-danger-600">
          <LockIcon className="h-5 w-5" aria-hidden="true" />
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={closing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="bg-danger-500 hover:bg-danger-600"
            onClick={confirm}
            loading={closing}
            loadingLabel="Closing…"
          >
            Close Poll
          </Button>
        </>
      }
    >
      {question ? (
        <p className="rounded-lg border border-line bg-canvas px-4 py-3 text-sm font-semibold text-ink">
          {question}
        </p>
      ) : null}
    </Modal>
  );
}
