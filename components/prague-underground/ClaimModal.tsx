'use client';

import { useState, useRef, useCallback } from 'react';
import type { Venue } from '@/lib/prague-underground/types';

interface ClaimModalProps {
  venue: Venue;
  userId: string;
  onClose: () => void;
  onClaimed: () => void;
}

export default function ClaimModal({ venue, userId, onClose, onClaimed }: ClaimModalProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setPhoto(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!photo) {
      setError('A photo is required to claim this venue');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('venueId', venue.id);
      formData.append('photo', photo);
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      const res = await fetch('/api/prague-underground/claim', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to submit claim');
        setSubmitting(false);
        return;
      }

      onClaimed();
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }, [photo, userId, venue.id, notes, onClaimed]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !submitting) {
      onClose();
    }
  }, [submitting, onClose]);

  return (
    <div className="pu-modal-overlay" onClick={handleOverlayClick}>
      <div className="pu-modal">
        <p className="pu-modal-title">Claim This Venue</p>
        <p className="pu-modal-venue-name">{venue.name} &middot; {venue.points} pts</p>

        <label className="pu-modal-label">Photo Evidence</label>
        <div
          className="pu-modal-upload"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="pu-modal-upload-preview" />
          ) : (
            <span className="pu-modal-upload-text">Click to upload a photo</span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        <label className="pu-modal-label">Notes (optional)</label>
        <textarea
          className="pu-modal-textarea"
          placeholder="What did you find? What did you feel?"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          disabled={submitting}
        />

        <div className="pu-modal-actions">
          <button
            className="pu-modal-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="pu-modal-submit"
            onClick={handleSubmit}
            disabled={!photo || submitting}
          >
            {submitting ? 'Claiming\u2026' : 'Claim'}
          </button>
        </div>

        {error ? <p className="pu-modal-error">{error}</p> : null}
      </div>
    </div>
  );
}
