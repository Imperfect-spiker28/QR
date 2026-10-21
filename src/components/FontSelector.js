import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FONT_CATALOG, FONT_CATEGORIES, loadGoogleFont } from '../utils/fontCatalog';

export default function FontSelector({
  selectedFont,
  onSelectFont,
  captionText = 'SCAN TO OPEN',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Ensure current selected font is loaded
  useEffect(() => {
    if (selectedFont) {
      loadGoogleFont(selectedFont);
    }
  }, [selectedFont]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      // Focus search input on next tick
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Click outside to dismiss
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filtered font list
  const filteredFonts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FONT_CATALOG.filter((f) => {
      const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
      const matchesSearch = !q || f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  // Reset highlight index if filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredFonts.length, activeCategory]);

  // Lazy-load visible fonts when list changes or opens
  useEffect(() => {
    if (isOpen && filteredFonts.length > 0) {
      // Pre-load the first 15 fonts in current view for snappy typography preview
      const topBatch = filteredFonts.slice(0, 16);
      topBatch.forEach((f) => loadGoogleFont(f.name));
    }
  }, [isOpen, filteredFonts]);

  // Select font handler
  const handleSelect = useCallback(
    (fontName) => {
      loadGoogleFont(fontName);
      onSelectFont(fontName);
      setIsOpen(false);
    },
    [onSelectFont]
  );

  // Keyboard navigation within list
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < filteredFonts.length - 1 ? prev + 1 : 0;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredFonts.length - 1;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredFonts.length) {
        handleSelect(filteredFonts[highlightedIndex].name);
      }
    }
  };

  const scrollIndexIntoView = (index) => {
    if (!listRef.current) return;
    const itemEl = listRef.current.children[index];
    if (itemEl) {
      itemEl.scrollIntoView({ block: 'nearest' });
    }
  };

  return (
    <div className="qro-font-selector-container" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`qro-font-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select caption font, currently ${selectedFont}`}
      >
        <div className="qro-font-trigger-left">
          <span
            className="qro-font-trigger-preview-badge"
            style={{ fontFamily: `"${selectedFont}", sans-serif` }}
            title={selectedFont}
          >
            Aa
          </span>
          <div className="qro-font-trigger-info">
            <span
              className="qro-font-trigger-name"
              style={{ fontFamily: `"${selectedFont}", sans-serif` }}
            >
              {selectedFont}
            </span>
            <span className="qro-font-trigger-category">
              {FONT_CATALOG.find((f) => f.name === selectedFont)?.category || 'Google Font'}
            </span>
          </div>
        </div>

        <div className="qro-font-trigger-right">
          <span className="qro-font-count-tag">{FONT_CATALOG.length}+</span>
          <svg
            className={`qro-font-chevron ${isOpen ? 'open' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Font Dropdown Popover */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div className="qro-font-mobile-backdrop" onClick={() => setIsOpen(false)} />

          <div
            ref={dropdownRef}
            className="qro-font-dropdown-panel"
            role="listbox"
            aria-label="Font options"
          >
            {/* Header: Title & Count */}
            <div className="qro-font-panel-header">
              <div className="qro-font-header-title">
                <span className="qro-font-header-dot" />
                <span>Typography Library ({FONT_CATALOG.length} Fonts)</span>
              </div>
              <button
                type="button"
                className="qro-font-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close font selector"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="qro-font-search-wrap">
              <svg
                className="qro-font-search-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                className="qro-font-search-input"
                placeholder="Search fonts (e.g. Poppins, Serif, Mono)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck="false"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="qro-font-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="qro-font-category-tabs">
              {FONT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`qro-font-cat-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scrollable Font List */}
            <div className="qro-font-list" ref={listRef} role="presentation">
              {filteredFonts.length === 0 ? (
                <div className="qro-font-empty-state">
                  <span>No fonts match "{searchQuery}"</span>
                  <button
                    type="button"
                    className="qro-font-reset-search-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('All');
                    }}
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                filteredFonts.map((font, idx) => {
                  const isSelected = selectedFont === font.name;
                  const isHighlighted = highlightedIndex === idx;

                  return (
                    <div
                      key={font.name}
                      role="option"
                      aria-selected={isSelected}
                      className={`qro-font-item ${isSelected ? 'selected' : ''} ${
                        isHighlighted ? 'highlighted' : ''
                      }`}
                      onClick={() => handleSelect(font.name)}
                      onMouseEnter={() => {
                        setHighlightedIndex(idx);
                        loadGoogleFont(font.name);
                      }}
                    >
                      <div className="qro-font-item-main">
                        <div className="qro-font-item-meta">
                          <span
                            className="qro-font-item-name"
                            style={{ fontFamily: `"${font.name}", ${font.fallback}` }}
                          >
                            {font.name}
                          </span>
                          <span className="qro-font-item-cat-badge">{font.category}</span>
                        </div>

                        {/* Visual typography sample rendering live */}
                        <div
                          className="qro-font-item-sample"
                          style={{ fontFamily: `"${font.name}", ${font.fallback}` }}
                        >
                          {captionText || 'SCAN TO OPEN'}
                        </div>
                      </div>

                      {/* Selected checkmark */}
                      {isSelected && (
                        <div className="qro-font-selected-check" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
