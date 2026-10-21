/**
 * QRo Typography Engine - Google Fonts Catalog & Dynamic Loader
 * Provides 135+ curated, genuinely distinct fonts organized across 7 categories.
 */

export const FONT_CATEGORIES = [
  'All',
  'Sans Serif',
  'Serif',
  'Display',
  'Monospace',
  'Handwritten',
  'Modern',
  'Decorative',
];

export const FONT_CATALOG = [
  // --- SANS SERIF (25) ---
  { name: 'Plus Jakarta Sans', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Inter', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Roboto', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Open Sans', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Lato', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Montserrat', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Poppins', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Outfit', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Manrope', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'DM Sans', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Raleway', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Nunito', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Work Sans', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Rubik', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Quicksand', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Barlow', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Jost', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Urbanist', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Figtree', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Lexend', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Archivo', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Public Sans', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Cabin', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Kanit', category: 'Sans Serif', fallback: 'sans-serif' },
  { name: 'Heebo', category: 'Sans Serif', fallback: 'sans-serif' },

  // --- SERIF (20) ---
  { name: 'Playfair Display', category: 'Serif', fallback: 'serif' },
  { name: 'Merriweather', category: 'Serif', fallback: 'serif' },
  { name: 'Lora', category: 'Serif', fallback: 'serif' },
  { name: 'PT Serif', category: 'Serif', fallback: 'serif' },
  { name: 'EB Garamond', category: 'Serif', fallback: 'serif' },
  { name: 'Cormorant Garamond', category: 'Serif', fallback: 'serif' },
  { name: 'Bitter', category: 'Serif', fallback: 'serif' },
  { name: 'Cinzel', category: 'Serif', fallback: 'serif' },
  { name: 'Libre Baskerville', category: 'Serif', fallback: 'serif' },
  { name: 'Arvo', category: 'Serif', fallback: 'serif' },
  { name: 'Spectral', category: 'Serif', fallback: 'serif' },
  { name: 'DM Serif Display', category: 'Serif', fallback: 'serif' },
  { name: 'Bodoni Moda', category: 'Serif', fallback: 'serif' },
  { name: 'Cardo', category: 'Serif', fallback: 'serif' },
  { name: 'Faustina', category: 'Serif', fallback: 'serif' },
  { name: 'Vollkorn', category: 'Serif', fallback: 'serif' },
  { name: 'Frank Ruhl Libre', category: 'Serif', fallback: 'serif' },
  { name: 'Prata', category: 'Serif', fallback: 'serif' },
  { name: 'Newsreader', category: 'Serif', fallback: 'serif' },
  { name: 'Castoro', category: 'Serif', fallback: 'serif' },

  // --- DISPLAY (18) ---
  { name: 'Bebas Neue', category: 'Display', fallback: 'sans-serif' },
  { name: 'Oswald', category: 'Display', fallback: 'sans-serif' },
  { name: 'Anton', category: 'Display', fallback: 'sans-serif' },
  { name: 'Lobster', category: 'Display', fallback: 'cursive' },
  { name: 'Righteous', category: 'Display', fallback: 'sans-serif' },
  { name: 'Abril Fatface', category: 'Display', fallback: 'serif' },
  { name: 'Fredoka', category: 'Display', fallback: 'sans-serif' },
  { name: 'Bangers', category: 'Display', fallback: 'cursive' },
  { name: 'Alfa Slab One', category: 'Display', fallback: 'serif' },
  { name: 'Shrikhand', category: 'Display', fallback: 'serif' },
  { name: 'Titan One', category: 'Display', fallback: 'sans-serif' },
  { name: 'Passion One', category: 'Display', fallback: 'sans-serif' },
  { name: 'Chango', category: 'Display', fallback: 'cursive' },
  { name: 'Bungee', category: 'Display', fallback: 'sans-serif' },
  { name: 'Black Han Sans', category: 'Display', fallback: 'sans-serif' },
  { name: 'Yeseva One', category: 'Display', fallback: 'serif' },
  { name: 'Ultra', category: 'Display', fallback: 'serif' },
  { name: 'Bowlby One', category: 'Display', fallback: 'sans-serif' },

  // --- MONOSPACE (16) ---
  { name: 'JetBrains Mono', category: 'Monospace', fallback: 'monospace' },
  { name: 'Fira Code', category: 'Monospace', fallback: 'monospace' },
  { name: 'Space Mono', category: 'Monospace', fallback: 'monospace' },
  { name: 'Inconsolata', category: 'Monospace', fallback: 'monospace' },
  { name: 'Roboto Mono', category: 'Monospace', fallback: 'monospace' },
  { name: 'Source Code Pro', category: 'Monospace', fallback: 'monospace' },
  { name: 'IBM Plex Mono', category: 'Monospace', fallback: 'monospace' },
  { name: 'Courier Prime', category: 'Monospace', fallback: 'monospace' },
  { name: 'DM Mono', category: 'Monospace', fallback: 'monospace' },
  { name: 'Share Tech Mono', category: 'Monospace', fallback: 'monospace' },
  { name: 'Overpass Mono', category: 'Monospace', fallback: 'monospace' },
  { name: 'Anonymous Pro', category: 'Monospace', fallback: 'monospace' },
  { name: 'VT323', category: 'Monospace', fallback: 'monospace' },
  { name: 'Major Mono Display', category: 'Monospace', fallback: 'monospace' },
  { name: 'Cutive Mono', category: 'Monospace', fallback: 'monospace' },
  { name: 'Nova Mono', category: 'Monospace', fallback: 'monospace' },

  // --- HANDWRITTEN (20) ---
  { name: 'Caveat', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Pacifico', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Dancing Script', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Shadows Into Light', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Satisfy', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Sacramento', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Great Vibes', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Kaushan Script', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Indie Flower', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Permanent Marker', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Yellowtail', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Marck Script', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Homemade Apple', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Courgette', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Bad Script', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Alex Brush', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Damion', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Parisienne', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Allura', category: 'Handwritten', fallback: 'cursive' },
  { name: 'Reenie Beanie', category: 'Handwritten', fallback: 'cursive' },

  // --- MODERN (18) ---
  { name: 'Space Grotesk', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Syne', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Unbounded', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Sora', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Epilogue', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Darker Grotesque', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Big Shoulders Display', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Syncopate', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Michroma', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Audiowide', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Orbitron', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Exo 2', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Rajdhani', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Chakra Petch', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Teko', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Bruno Ace', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Russo One', category: 'Modern', fallback: 'sans-serif' },
  { name: 'Electrolize', category: 'Modern', fallback: 'sans-serif' },

  // --- DECORATIVE (18) ---
  { name: 'Press Start 2P', category: 'Decorative', fallback: 'monospace' },
  { name: 'Bungee Shade', category: 'Decorative', fallback: 'cursive' },
  { name: 'Creepster', category: 'Decorative', fallback: 'cursive' },
  { name: 'Rye', category: 'Decorative', fallback: 'serif' },
  { name: 'Sancreek', category: 'Decorative', fallback: 'serif' },
  { name: 'Vast Shadow', category: 'Decorative', fallback: 'serif' },
  { name: 'Megrim', category: 'Decorative', fallback: 'cursive' },
  { name: 'Silkscreen', category: 'Decorative', fallback: 'monospace' },
  { name: 'Tourney', category: 'Decorative', fallback: 'sans-serif' },
  { name: 'Grenze Gotisch', category: 'Decorative', fallback: 'serif' },
  { name: 'Henny Penny', category: 'Decorative', fallback: 'cursive' },
  { name: 'Flavors', category: 'Decorative', fallback: 'cursive' },
  { name: 'Festive', category: 'Decorative', fallback: 'cursive' },
  { name: 'Freckle Face', category: 'Decorative', fallback: 'cursive' },
  { name: 'Monoton', category: 'Decorative', fallback: 'cursive' },
  { name: 'Faster One', category: 'Decorative', fallback: 'cursive' },
  { name: 'Ribeye', category: 'Decorative', fallback: 'serif' },
  { name: 'Special Elite', category: 'Decorative', fallback: 'cursive' },
];

// In-memory set of loaded fonts
const loadedFonts = new Set(['Plus Jakarta Sans', 'Playfair Display', 'Outfit', 'monospace', 'sans-serif', 'serif']);

/**
 * Dynamically loads a font from Google Fonts by appending a link element.
 * Idempotent: Only injects once per font.
 */
export function loadGoogleFont(fontName) {
  if (!fontName || loadedFonts.has(fontName)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    try {
      const familyParam = encodeURIComponent(fontName).replace(/%20/g, '+');
      const href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@400;700&display=swap`;

      // Check if link already exists in DOM
      const existing = document.querySelector(`link[data-qro-font="${fontName}"]`);
      if (existing) {
        loadedFonts.add(fontName);
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-qro-font', fontName);

      link.onload = () => {
        loadedFonts.add(fontName);
        resolve();
      };

      link.onerror = () => {
        // Fallback: try without weights if weight-specific stylesheet failed
        const simpleHref = `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`;
        const fallbackLink = document.createElement('link');
        fallbackLink.rel = 'stylesheet';
        fallbackLink.href = simpleHref;
        fallbackLink.setAttribute('data-qro-font', fontName);
        fallbackLink.onload = () => {
          loadedFonts.add(fontName);
          resolve();
        };
        fallbackLink.onerror = () => {
          // Never block UI on font load failure
          resolve();
        };
        document.head.appendChild(fallbackLink);
      };

      document.head.appendChild(link);
    } catch (err) {
      console.warn('Font load error:', err);
      resolve();
    }
  });
}

/**
 * Loads a batch of fonts simultaneously.
 */
export function loadGoogleFontsBatch(fontNames) {
  return Promise.all(fontNames.map((name) => loadGoogleFont(name)));
}

/**
 * Ensures the font is loaded and parsed into the browser font engine
 * before canvas drawing or export execution.
 */
export async function ensureFontLoaded(fontName) {
  if (!fontName) return;
  await loadGoogleFont(fontName);
  if (document.fonts && document.fonts.load) {
    try {
      await Promise.all([
        document.fonts.load(`bold 14px "${fontName}"`),
        document.fonts.load(`14px "${fontName}"`),
        document.fonts.load(`bold 24px "${fontName}"`),
      ]);
      await document.fonts.ready;
    } catch (e) {
      // Graceful fallback if font is slightly delayed
    }
  }
}
