import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import SummaryModal from '../components/SummaryModal';
import QuizModal from '../components/QuizModal';
import { Sparkles, HelpCircle, Eye, Calendar, Clock, AlertCircle } from 'lucide-react';

const AIHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [error, setError] = useState('');

  const [activeSummary, setActiveSummary] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.getAIHistory({ type: filterType, limit: 30 });
        if (res.success) {
          setHistory(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load AI history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [filterType]);

  const handleView = (item) => {
    if (item.requestType === 'summary') {
      setActiveSummary({
        noteTitle: item.note?.title || 'Study Note',
        summary: item.response?.summary || 'No summary text available.',
        modelUsed: item.modelUsed,
        durationMs: item.durationMs
      });
    } else if (item.requestType === 'practice_questions') {
      setActiveQuiz({
        noteTitle: item.note?.title || 'Study Note',
        questions: item.response?.questions || []
      });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>AI Request History</h2>
          <p className="subtitle">Audit and review all previous AI summaries and practice tests generated for your notes</p>
        </div>

        <div className="type-toggle-group">
          <button
            className={`btn-toggle ${filterType === '' ? 'active' : ''}`}
            onClick={() => setFilterType('')}
          >
            All Requests
          </button>
          <button
            className={`btn-toggle ${filterType === 'summary' ? 'active' : ''}`}
            onClick={() => setFilterType('summary')}
          >
            Summaries
          </button>
          <button
            className={`btn-toggle ${filterType === 'practice_questions' ? 'active' : ''}`}
            onClick={() => setFilterType('practice_questions')}
          >
            Practice Quizzes
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading AI request log...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <Sparkles size={40} className="empty-icon" />
          <h3>No AI requests recorded yet</h3>
          <p>Generate a summary or practice questions from any note to see your history logged here.</p>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Target Note</th>
                <th>Status</th>
                <th>Model</th>
                <th>Latency</th>
                <th>Generated At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item._id}>
                  <td>
                    <span className={`type-badge ${item.requestType}`}>
                      {item.requestType === 'summary' ? (
                        <>
                          <Sparkles size={13} /> Summary
                        </>
                      ) : (
                        <>
                          <HelpCircle size={13} /> Practice Quiz
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <strong>{item.note?.title || 'Unknown Note'}</strong>
                    {item.note?.subject && (
                      <span className="table-sub-subject">{item.note.subject}</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <span className="table-mono">{item.modelUsed || 'default'}</span>
                  </td>
                  <td>{item.durationMs ? `${(item.durationMs / 1000).toFixed(2)}s` : '-'}</td>
                  <td>
                    <span className="table-date">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-table-action"
                      onClick={() => handleView(item)}
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modals */}
      <SummaryModal
        isOpen={activeSummary !== null}
        onClose={() => setActiveSummary(null)}
        data={activeSummary}
      />

      <QuizModal
        isOpen={activeQuiz !== null}
        onClose={() => setActiveQuiz(null)}
        data={activeQuiz}
      />
    </div>
  );
};

export default AIHistoryPage;
