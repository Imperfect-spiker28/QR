import React, { useState, useEffect, useRef, useCallback } from 'react';

// Color conversion utilities
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 33, g: 241, b: 168 };
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return { r: 33, g: 241, b: 168 };
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 33, g: 241, b: 168 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r, g, b) {
  const clamp = (val) => Math.max(0, Math.min(255, Math.round(Number(val) || 0)));
  const toHex = (c) => clamp(c).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsv(r, g, b) {
  r = Math.max(0, Math.min(255, r)) / 255;
  g = Math.max(0, Math.min(255, g)) / 255;
  b = Math.max(0, Math.min(255, b)) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  return { h, s, v };
}

export function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  v = Math.max(0, Math.min(1, v));
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function hsvToHex(h, s, v) {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

// Curated preset color palette
export const CURATED_SWATCHES = [
  '#21F1A8', // Tiffany Signature
  '#05D588', // Mint Teal
  '#171717', // Obsidian Charcoal
  '#FFFFFF', // Crisp White
  '#06B6D4', // Cyber Cyan
  '#3B82F6', // Royal Blue
  '#8B5CF6', // Neon Violet
  '#EC4899', // Pink Blossom
  '#F59E0B', // Golden Amber
  '#EF4444', // Crimson Flame
  '#10B981', // Emerald Green
  '#1E293B', // Deep Slate
];

export default function ColorPickerPopover({
  color,
  onChange,
  label = 'Select Color',
  compact = false,
  swatchPreviewStyle = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const satValRef = useRef(null);
  const hueRef = useRef(null);

  // Decompose incoming hex into HSV & RGB
  const rgb = hexToRgb(color);
  const initialHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const [hsv, setHsv] = useState(initialHsv);
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  const [isDraggingSat, setIsDraggingSat] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [popoverPlacement, setPopoverPlacement] = useState('bottom');

  // Synchronize when outer color prop changes
  useEffect(() => {
    const curRgb = hexToRgb(color);
    const newHsv = rgbToHsv(curRgb.r, curRgb.g, curRgb.b);
    setHsv(newHsv);
    setHexInput(color.toUpperCase());
  }, [color]);

  // Check positioning to avoid overflowing viewport
  const updatePlacement = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverHeight = 380;
    if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
      setPopoverPlacement('top');
    } else {
      setPopoverPlacement('bottom');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePlacement();
      window.addEventListener('resize', updatePlacement);
      window.addEventListener('scroll', updatePlacement, true);
    }
    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [isOpen, updatePlacement]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle Saturation/Brightness pointer drag
  const handleSatValPointer = useCallback(
    (e) => {
      if (!satValRef.current) return;
      const rect = satValRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

      const s = x / rect.width;
      const v = 1 - y / rect.height;

      const updatedHsv = { ...hsv, s, v };
      setHsv(updatedHsv);
      const newHex = hsvToHex(updatedHsv.h, s, v);
      setHexInput(newHex);
      onChange(newHex);
    },
    [hsv, onChange]
  );

  // Handle Hue pointer drag
  const handleHuePointer = useCallback(
    (e) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const h = Math.round((x / rect.width) * 360) % 360;

      const updatedHsv = { ...hsv, h };
      setHsv(updatedHsv);
      const newHex = hsvToHex(h, updatedHsv.s, updatedHsv.v);
      setHexInput(newHex);
      onChange(newHex);
    },
    [hsv, onChange]
  );

  // Global pointer move & up listeners during drag
  useEffect(() => {
    function onPointerMove(e) {
      if (isDraggingSat) {
        handleSatValPointer(e);
      } else if (isDraggingHue) {
        handleHuePointer(e);
      }
    }

    function onPointerUp() {
      setIsDraggingSat(false);
      setIsDraggingHue(false);
    }

    if (isDraggingSat || isDraggingHue) {
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [isDraggingSat, isDraggingHue, handleSatValPointer, handleHuePointer]);

  // Handle Hex typed input
  const handleHexChange = (e) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith('#') && val.length > 0) {
      val = '#' + val;
    }
    setHexInput(val);
    const clean = val.replace('#', '');
    if (/^[0-9A-F]{6}$/i.test(clean)) {
      const newRgb = hexToRgb(val);
      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setHsv(newHsv);
      onChange(val);
    }
  };

  // Handle RGB typed inputs
  const handleRgbChange = (channel, val) => {
    const num = Math.max(0, Math.min(255, parseInt(val, 10) || 0));
    const currentRgb = hexToRgb(color);
    const newRgb = { ...currentRgb, [channel]: num };
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setHsv(newHsv);
    setHexInput(newHex);
    onChange(newHex);
  };

  // EyeDropper API (supported in Chromium browsers)
  const handleEyeDropper = async () => {
    if (window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          const sampledHex = result.sRGBHex.toUpperCase();
          const sRgb = hexToRgb(sampledHex);
          const sHsv = rgbToHsv(sRgb.r, sRgb.g, sRgb.b);
          setHsv(sHsv);
          setHexInput(sampledHex);
          onChange(sampledHex);
        }
      } catch (err) {
        // User cancelled eyedropper
      }
    }
  };

  const currentRgb = hexToRgb(color);
  const hueColor = `hsl(${hsv.h}, 100%, 50%)`;

  return (
    <div className={`qro-custom-picker-container ${compact ? 'compact' : ''}`} ref={containerRef}>
      {/* Trigger Button */}
      {compact ? (
        <button
          type="button"
          className="qro-compact-color-trigger"
          onClick={() => setIsOpen(!isOpen)}
          title={`Change ${label}`}
          aria-label={`Change ${label}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          style={swatchPreviewStyle || { background: color }}
        />
      ) : (
        <button
          type="button"
          className={`qro-color-picker-box ${isOpen ? 'active-trigger' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={`${label} selector, current value ${color}`}
        >
          <div className="qro-color-preview-group">
            <div
              className="qro-color-swatch"
              style={swatchPreviewStyle || { background: color }}
            />
            <span className="qro-color-hex">{color.toUpperCase()}</span>
          </div>
          <svg
            className={`qro-color-chevron ${isOpen ? 'open' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      {/* Custom Charcoal & Tiffany Popover */}
      {isOpen && (
        <>
          {/* Backdrop on mobile screens to ensure perfect containment */}
          <div className="qro-picker-mobile-backdrop" onClick={() => setIsOpen(false)} />

          <div
            ref={popoverRef}
            className={`qro-picker-popover placement-${popoverPlacement}`}
            role="dialog"
            aria-label={`${label} Color Picker`}
          >
            {/* Popover Header */}
            <div className="qro-picker-header">
              <div className="qro-picker-title-group">
                <span className="qro-picker-dot" />
                <span className="qro-picker-title">{label}</span>
              </div>
              <div className="qro-picker-header-actions">
                {window.EyeDropper && (
                  <button
                    type="button"
                    className="qro-picker-icon-action"
                    onClick={handleEyeDropper}
                    title="Pick color from screen"
                    aria-label="Sample screen color"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m15 2 7 7-4 4-2-2-4 4-2-2 4-4-2-2 3-3z" />
                      <path d="M2 22s2-4 4-4l4 4-4 4s-4-2-4-4z" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  className="qro-picker-close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close color picker"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Saturation / Brightness 2D Interactive Pad */}
            <div
              ref={satValRef}
              className="qro-picker-sat-pad"
              style={{ backgroundColor: hueColor }}
              onMouseDown={(e) => {
                setIsDraggingSat(true);
                handleSatValPointer(e);
              }}
              onTouchStart={(e) => {
                setIsDraggingSat(true);
                handleSatValPointer(e);
              }}
              role="slider"
              aria-label="Saturation and Brightness"
              aria-valuenow={Math.round(hsv.v * 100)}
              tabIndex={0}
              onKeyDown={(e) => {
                let { s, v, h } = hsv;
                let changed = false;
                if (e.key === 'ArrowRight') { s = Math.min(1, s + 0.05); changed = true; }
                if (e.key === 'ArrowLeft') { s = Math.max(0, s - 0.05); changed = true; }
                if (e.key === 'ArrowUp') { v = Math.min(1, v + 0.05); changed = true; }
                if (e.key === 'ArrowDown') { v = Math.max(0, v - 0.05); changed = true; }
                if (changed) {
                  e.preventDefault();
                  const updatedHsv = { h, s, v };
                  setHsv(updatedHsv);
                  const newHex = hsvToHex(h, s, v);
                  setHexInput(newHex);
                  onChange(newHex);
                }
              }}
            >
              <div className="qro-picker-sat-white" />
              <div className="qro-picker-sat-black" />
              <div
                className="qro-picker-sat-thumb"
                style={{
                  left: `${hsv.s * 100}%`,
                  top: `${(1 - hsv.v) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>

            {/* Hue Rainbow Slider Track */}
            <div className="qro-picker-slider-row">
              <div
                ref={hueRef}
                className="qro-picker-hue-track"
                onMouseDown={(e) => {
                  setIsDraggingHue(true);
                  handleHuePointer(e);
                }}
                onTouchStart={(e) => {
                  setIsDraggingHue(true);
                  handleHuePointer(e);
                }}
                role="slider"
                aria-label="Hue"
                aria-valuenow={hsv.h}
                tabIndex={0}
                onKeyDown={(e) => {
                  let { h, s, v } = hsv;
                  let changed = false;
                  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    h = (h + 5) % 360;
                    changed = true;
                  }
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    h = (h - 5 + 360) % 360;
                    changed = true;
                  }
                  if (changed) {
                    e.preventDefault();
                    const updatedHsv = { h, s, v };
                    setHsv(updatedHsv);
                    const newHex = hsvToHex(h, s, v);
                    setHexInput(newHex);
                    onChange(newHex);
                  }
                }}
              >
                <div
                  className="qro-picker-hue-thumb"
                  style={{
                    left: `${(hsv.h / 360) * 100}%`,
                    backgroundColor: hueColor,
                  }}
                />
              </div>

              {/* Live Preview Circle */}
              <div className="qro-picker-live-swatch" style={{ background: color }} title={color} />
            </div>

            {/* Inputs: Hex and RGB numeric controls */}
            <div className="qro-picker-inputs-group">
              <div className="qro-picker-input-col hex-col">
                <label className="qro-picker-input-label">HEX</label>
                <input
                  type="text"
                  className="qro-picker-field hex-field"
                  value={hexInput}
                  onChange={handleHexChange}
                  maxLength={7}
                  placeholder="#21F1A8"
                  spellCheck="false"
                />
              </div>

              <div className="qro-picker-input-col rgb-col">
                <label className="qro-picker-input-label">R</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  className="qro-picker-field num-field"
                  value={currentRgb.r}
                  onChange={(e) => handleRgbChange('r', e.target.value)}
                />
              </div>

              <div className="qro-picker-input-col rgb-col">
                <label className="qro-picker-input-label">G</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  className="qro-picker-field num-field"
                  value={currentRgb.g}
                  onChange={(e) => handleRgbChange('g', e.target.value)}
                />
              </div>

              <div className="qro-picker-input-col rgb-col">
                <label className="qro-picker-input-label">B</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  className="qro-picker-field num-field"
                  value={currentRgb.b}
                  onChange={(e) => handleRgbChange('b', e.target.value)}
                />
              </div>
            </div>

            {/* Curated Swatches Row */}
            <div className="qro-picker-swatches-section">
              <div className="qro-picker-swatches-title">CURATED PALETTE</div>
              <div className="qro-picker-swatches-grid">
                {CURATED_SWATCHES.map((swatch) => {
                  const isSelected = color.toUpperCase() === swatch.toUpperCase();
                  return (
                    <button
                      key={swatch}
                      type="button"
                      className={`qro-picker-preset-dot ${isSelected ? 'active-swatch' : ''}`}
                      style={{ backgroundColor: swatch }}
                      onClick={() => {
                        const sRgb = hexToRgb(swatch);
                        const sHsv = rgbToHsv(sRgb.r, sRgb.g, sRgb.b);
                        setHsv(sHsv);
                        setHexInput(swatch.toUpperCase());
                        onChange(swatch);
                      }}
                      title={swatch}
                      aria-label={`Select swatch ${swatch}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
