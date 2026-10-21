import React, { useState } from 'react';

/**
 * Local Raw Data Inspector
 * Allows users to inspect the exact payload encoded into the active QR code.
 *
 * Privacy Guarantees:
 * - 100% Client-Side: Payload is read directly from React state in browser memory.
 * - Zero Network: Never sent to analytics, third-party APIs, or external logs.
 * - Zero Persistence: Never saved to localStorage, indexedDB, or cookies.
 */
export default function RawDataInspector({ payload, contentType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!payload) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = payload;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.warn('Copying to clipboard failed', e);
    }
  };

  const isSensitive = contentType === 'wifi' || contentType === 'contact';
  const charCount = typeof payload === 'string' ? payload.length : 0;
  const lineCount = typeof payload === 'string' ? payload.split('\n').length : 0;

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'link':
        return 'Direct URL';
      case 'text':
        return 'Plain Text';
      case 'wifi':
        return 'Wi-Fi Configuration';
      case 'contact':
        return 'vCard Contact';
      default:
        return 'Raw Payload';
    }
  };

  return (
    <div className="qro-inspector-container">
      <button
        type="button"
        id="qro-view-raw-btn"
        className={`qro-inspector-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="qro-raw-data-panel"
        aria-label={isOpen ? 'Hide encoded QR data inspector' : 'View exact encoded QR data inspector'}
      >
        <div className="qro-inspector-toggle-content">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>{isOpen ? 'Hide encoded data' : 'View encoded data'}</span>
        </div>
        <div className="qro-inspector-meta-row">
          <span className="qro-inspector-type-pill">{getContentTypeLabel()}</span>
          <svg
            className={`qro-inspector-chevron ${isOpen ? 'rotated' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div
          id="qro-raw-data-panel"
          className="qro-inspector-panel"
          role="region"
          aria-labelledby="qro-view-raw-btn"
        >
          {/* Header & Copy Button */}
          <div className="qro-inspector-panel-header">
            <div className="qro-inspector-stats">
              <span className="qro-inspector-badge">LOCAL MATRIX PAYLOAD</span>
              <span className="qro-inspector-count">
                {charCount} character{charCount === 1 ? '' : 's'}
                {lineCount > 1 ? ` • ${lineCount} lines` : ''}
              </span>
            </div>

            <button
              type="button"
              className={`qro-inspector-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              disabled={!payload}
              aria-label="Copy exact encoded payload to clipboard"
            >
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#21F1A8" strokeWidth="3" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>

          {/* Raw String Display */}
          <div className="qro-inspector-code-wrapper">
            {payload ? (
              <pre className="qro-inspector-code-block" tabIndex={0} aria-label="Exact string encoded in QR code">
                <code>{payload}</code>
              </pre>
            ) : (
              <div className="qro-inspector-empty" role="status">
                No payload generated yet. Enter content in the configuration tabs above.
              </div>
            )}
          </div>

          {/* Destination Distinction Note */}
          <p className="qro-inspector-note">
            <strong>Direct Destination Notice:</strong> This string is written directly into the QR code matrix.
            Scanning devices read this payload directly without passing through a QRo proxy. Any redirects
            encountered upon scanning are governed entirely by the destination website or server itself.
          </p>

          {/* Sensitive Payload Warning */}
          {isSensitive && (
            <div className="qro-inspector-warning" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2.2" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>
                <strong>Sensitive Content Warning:</strong> Anyone who scans this QR code can read this raw
                payload directly. Exercise care before printing private passwords or contact details on public materials.
              </span>
            </div>
          )}

          {/* Local Security Assurance */}
          <div className="qro-inspector-security-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#21F1A8" strokeWidth="2.5" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Inspected 100% locally in browser memory. Never transmitted or logged.</span>
          </div>
        </div>
      )}
    </div>
  );
}
