import React from 'react';
import { Trash2Icon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

/**
 * Confirmation dialog before permanently deleting a poll.
 *
 * Props:
 *   open        – whether the modal is visible
 *   question    – poll question shown as a preview
 *   onCancel    – dismiss without deleting
 *   onConfirm   – proceed with deletion
 *   loading     – parent controls async loading state
 */
export function DeletePollModal({ open, question, onCancel, onConfirm, loading = false }) {
  return (
    <Modal
      open={open}
      title="Delete this poll?"
      description="This will permanently delete the poll and all its vote data. This cannot be undone."
      onClose={loading ? undefined : onCancel}
      icon={
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-50 text-danger-600">
          <Trash2Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="bg-danger-500 hover:bg-danger-600 text-white border-transparent"
            onClick={onConfirm}
            loading={loading}
            loadingLabel="Deleting…"
          >
            Yes, delete poll
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
