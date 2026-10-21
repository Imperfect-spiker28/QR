import { FONT_CATALOG, FONT_CATEGORIES } from './fontCatalog';

describe('Font Catalog Verification', () => {
  test('contains at least 100 font options', () => {
    expect(FONT_CATALOG.length).toBeGreaterThanOrEqual(100);
  });

  test('contains all 7 required categories', () => {
    const required = [
      'Sans Serif',
      'Serif',
      'Display',
      'Monospace',
      'Handwritten',
      'Modern',
      'Decorative',
    ];
    required.forEach((cat) => {
      expect(FONT_CATEGORIES).toContain(cat);
      const inCat = FONT_CATALOG.filter((f) => f.category === cat);
      expect(inCat.length).toBeGreaterThan(0);
    });
  });

  test('contains no duplicate font names', () => {
    const names = FONT_CATALOG.map((f) => f.name.toLowerCase());
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  test('contains key user-requested fonts', () => {
    const requested = [
      'Inter',
      'Roboto',
      'Open Sans',
      'Lato',
      'Montserrat',
      'Poppins',
      'Outfit',
      'Manrope',
      'DM Sans',
      'Space Grotesk',
      'Plus Jakarta Sans',
      'Playfair Display',
      'Merriweather',
      'Lora',
      'Oswald',
      'Bebas Neue',
      'Anton',
      'Orbitron',
      'Space Mono',
      'JetBrains Mono',
      'Fira Code',
      'Caveat',
      'Pacifico',
      'Dancing Script',
      'Raleway',
    ];
    const available = new Set(FONT_CATALOG.map((f) => f.name));
    requested.forEach((name) => {
      expect(available.has(name)).toBe(true);
    });
  });
});
