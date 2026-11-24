import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const NoteModal = ({ isOpen, onClose, onSave, note = null }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General');
  const [tagsInput, setTagsInput] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setSubject(note.subject || 'General');
      setTagsInput(Array.isArray(note.tags) ? note.tags.join(', ') : '');
      setContent(note.content || '');
    } else {
      setTitle('');
      setSubject('General');
      setTagsInput('');
      setContent('');
    }
    setError('');
  }, [note, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both note title and content.');
      return;
    }

    setSubmitting(true);
    setError('');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await onSave({
        title: title.trim(),
        subject: subject.trim() || 'General',
        tags,
        content: content.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content note-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{note ? 'Edit Study Note' : 'Create New Note'}</h3>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div className="alert-banner alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Note Title *</label>
            <input
              type="text"
              placeholder="e.g., Photosynthesis & Cellular Respiration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={150}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Subject / Topic</label>
              <input
                type="text"
                placeholder="e.g., Biology, CS, History"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                placeholder="e.g., exam, biology, chapter-4"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Study Notes Content *</label>
            <textarea
              rows={8}
              placeholder="Write or paste your notes here... (minimum 5 characters)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              <Save size={16} />
              {submitting ? 'Saving...' : note ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
