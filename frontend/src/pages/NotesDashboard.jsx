import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NoteContext';
import { api } from '../services/api';
import NoteModal from '../components/NoteModal';
import SummaryModal from '../components/SummaryModal';
import QuizModal from '../components/QuizModal';
import { Plus, Search, Sparkles, HelpCircle, Edit2, Trash2, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

const NotesDashboard = () => {
  const { notes, subjects, pagination, loading, error, fetchNotes, fetchSubjects, createNote, updateNote, deleteNote } = useNotes();

  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'note-edit', 'note-create'
  const [editingNote, setEditingNote] = useState(null);

  // AI Modal States
  const [summaryData, setSummaryData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [aiLoadingId, setAiLoadingId] = useState(null);
  const [aiActionType, setAiActionType] = useState(null); // 'summary' | 'quiz'
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchNotes({
        search: search.trim(),
        subject: selectedSubject,
        page: 1
      });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, selectedSubject, fetchNotes]);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setActiveModal('note-create');
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setActiveModal('note-edit');
  };

  const handleSaveNote = async (payload) => {
    if (editingNote) {
      await updateNote(editingNote._id, payload);
    } else {
      await createNote(payload);
    }
  };

  const handleDeleteNote = async (noteId, title) => {
    if (window.confirm(`Are you sure you want to delete note "${title}"?`)) {
      try {
        await deleteNote(noteId);
      } catch (err) {
        setActionError(err.message || 'Failed to delete note');
      }
    }
  };

  const handleGenerateSummary = async (note) => {
    setActionError('');
    setAiLoadingId(note._id);
    setAiActionType('summary');

    try {
      const res = await api.generateSummary(note._id);
      if (res.success && res.data) {
        setSummaryData(res.data);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to generate summary');
    } finally {
      setAiLoadingId(null);
      setAiActionType(null);
    }
  };

  const handleGenerateQuiz = async (note) => {
    setActionError('');
    setAiLoadingId(note._id);
    setAiActionType('quiz');

    try {
      const res = await api.generateQuestions(note._id);
      if (res.success && res.data) {
        setQuizData(res.data);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to generate quiz');
    } finally {
      setAiLoadingId(null);
      setAiActionType(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>My Study Notes</h2>
          <p className="subtitle">Capture your learning and generate instant AI study resources</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} />
          <span>New Note</span>
        </button>
      </div>

      {actionError && (
        <div className="alert-banner alert-error">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="controls-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search notes by title, keywords or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="subject-filter-chips">
          <button
            className={`chip ${selectedSubject === '' ? 'active' : ''}`}
            onClick={() => setSelectedSubject('')}
          >
            All Subjects
          </button>
          {subjects.map((sub) => (
            <button
              key={sub}
              className={`chip ${selectedSubject === sub ? 'active' : ''}`}
              onClick={() => setSelectedSubject(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <BookOpen size={48} />
          </div>
          <h3>No study notes found</h3>
          <p>
            {search || selectedSubject
              ? 'Try modifying your search or filter criteria.'
              : 'Create your first study note to start generating AI summaries and practice quizzes.'}
          </p>
          <button className="btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Create Note
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => {
            const isNoteAiLoading = aiLoadingId === note._id;

            return (
              <div key={note._id} className="note-card">
                <div className="note-card-header">
                  <span className="subject-badge">{note.subject || 'General'}</span>
                  <div className="note-actions">
                    <button
                      className="icon-btn"
                      title="Edit note"
                      onClick={() => handleOpenEdit(note)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="icon-btn text-danger"
                      title="Delete note"
                      onClick={() => handleDeleteNote(note._id, note.title)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="note-title">{note.title}</h3>
                <p className="note-excerpt">{note.content}</p>

                {note.tags && note.tags.length > 0 && (
                  <div className="note-tags">
                    {note.tags.map((tag, idx) => (
                      <span key={idx} className="tag-pill">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="note-card-footer">
                  <span className="note-date">
                    {new Date(note.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>

                  <div className="ai-actions-group">
                    <button
                      className="btn-ai-action summary"
                      disabled={isNoteAiLoading}
                      onClick={() => handleGenerateSummary(note)}
                      title="Generate concise summary and takeaways"
                    >
                      {isNoteAiLoading && aiActionType === 'summary' ? (
                        <>
                          <Loader2 size={14} className="spin-icon" />
                          <span>Summarizing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Summary</span>
                        </>
                      )}
                    </button>

                    <button
                      className="btn-ai-action quiz"
                      disabled={isNoteAiLoading}
                      onClick={() => handleGenerateQuiz(note)}
                      title="Generate test preparation quiz questions"
                    >
                      {isNoteAiLoading && aiActionType === 'quiz' ? (
                        <>
                          <Loader2 size={14} className="spin-icon" />
                          <span>Preparing...</span>
                        </>
                      ) : (
                        <>
                          <HelpCircle size={14} />
                          <span>Practice Quiz</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <NoteModal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        onSave={handleSaveNote}
        note={editingNote}
      />

      <SummaryModal
        isOpen={summaryData !== null}
        onClose={() => setSummaryData(null)}
        data={summaryData}
      />

      <QuizModal
        isOpen={quizData !== null}
        onClose={() => setQuizData(null)}
        data={quizData}
      />
    </div>
  );
};

export default NotesDashboard;
