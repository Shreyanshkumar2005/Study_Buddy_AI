import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Cpu } from 'lucide-react';

const SummaryModal = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ai-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-with-badge">
            <div className="ai-icon-chip">
              <Sparkles size={18} />
            </div>
            <div>
              <h3>AI Study Summary</h3>
              <p className="subtitle">Synthesized from "{data.noteTitle}"</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-meta-row">
          <span className="badge-model">
            <Cpu size={13} /> {data.modelUsed || 'AI Engine'}
          </span>
          {data.durationMs && (
            <span className="badge-duration">
              Generated in {(data.durationMs / 1000).toFixed(2)}s
            </span>
          )}
        </div>

        <div className="summary-body">
          <pre className="summary-text-display">{data.summary}</pre>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;
