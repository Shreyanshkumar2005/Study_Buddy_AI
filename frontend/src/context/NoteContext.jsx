import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../services/api';

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getNotes(params);
      if (res.success) {
        setNotes(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await api.getSubjects();
      if (res.success) {
        setSubjects(res.data);
      }
    } catch (err) {
      console.warn('Failed to load subjects:', err.message);
    }
  }, []);

  const createNote = async (payload) => {
    const res = await api.createNote(payload);
    if (res.success && res.data) {
      setNotes((prev) => [res.data, ...prev]);
      fetchSubjects();
    }
    return res;
  };

  const updateNote = async (id, payload) => {
    const res = await api.updateNote(id, payload);
    if (res.success && res.data) {
      setNotes((prev) => prev.map((n) => (n._id === id ? res.data : n)));
      fetchSubjects();
    }
    return res;
  };

  const deleteNote = async (id) => {
    const res = await api.deleteNote(id);
    if (res.success) {
      setNotes((prev) => prev.filter((n) => n._id !== id));
      fetchSubjects();
    }
    return res;
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        subjects,
        pagination,
        loading,
        error,
        fetchNotes,
        fetchSubjects,
        createNote,
        updateNote,
        deleteNote
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) throw new Error('useNotes must be used within a NoteProvider');
  return context;
};
