import React, { useState } from 'react';
import { X, CheckCircle, XCircle, RotateCcw, Award } from 'lucide-react';

const QuizModal = ({ isOpen, onClose, data }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !data || !Array.isArray(data.questions)) return null;

  const questions = data.questions;

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const score = calculateScore();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quiz-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>AI Practice Quiz</h3>
            <p className="subtitle">Test your retention on "{data.noteTitle}"</p>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        {submitted && (
          <div className="quiz-score-banner">
            <Award size={28} className="score-icon" />
            <div>
              <h4>Your Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)</h4>
              <p>
                {score === questions.length
                  ? 'Outstanding! You have mastered these study notes.'
                  : 'Good effort! Review the explanations below to reinforce your knowledge.'}
              </p>
            </div>
          </div>
        )}

        <div className="quiz-questions-list">
          {questions.map((q, qIdx) => {
            const chosen = selectedAnswers[qIdx];
            const isAnswered = chosen !== undefined;
            const isCorrect = isAnswered && chosen === q.correctIndex;

            return (
              <div key={q.id || qIdx} className="quiz-question-card">
                <div className="question-header">
                  <span className="q-number">Q{qIdx + 1}</span>
                  <span className="q-text">{q.question}</span>
                </div>

                <div className="options-grid">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    let optionClass = 'quiz-option';

                    if (submitted) {
                      if (optIdx === q.correctIndex) {
                        optionClass += ' correct-option';
                      } else if (isSelected) {
                        optionClass += ' wrong-option';
                      }
                    } else if (isSelected) {
                      optionClass += ' selected';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        className={optionClass}
                        onClick={() => handleSelect(qIdx, optIdx)}
                        disabled={submitted}
                      >
                        <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                        <span className="opt-text">{opt}</span>
                        {submitted && optIdx === q.correctIndex && <CheckCircle size={16} className="status-ico-green" />}
                        {submitted && isSelected && optIdx !== q.correctIndex && <XCircle size={16} className="status-ico-red" />}
                      </button>
                    );
                  })}
                </div>

                {submitted && q.explanation && (
                  <div className="explanation-box">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="modal-actions">
          {submitted ? (
            <>
              <button type="button" className="btn-secondary" onClick={handleReset}>
                <RotateCcw size={16} /> Retake Quiz
              </button>
              <button type="button" className="btn-primary" onClick={onClose}>
                Close
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setSubmitted(true)}
                disabled={Object.keys(selectedAnswers).length === 0}
              >
                Submit Answers
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
