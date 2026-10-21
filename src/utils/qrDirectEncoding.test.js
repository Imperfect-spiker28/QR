import qrcode from 'qrcode-generator';
import jsQR from 'jsqr';

/**
 * Helper to generate a matrix bitmap from qrcode-generator and decode with jsQR
 */
function decodeQrMatrix(text, errorCorrection = 'M', maskCenter = false) {
  const qr = qrcode(0, errorCorrection);
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  const scale = 6;
  const size = count * scale;
  const data = new Uint8ClampedArray(size * size * 4);

  const centerStart = Math.floor(count * 0.38);
  const centerEnd = Math.floor(count * 0.62);

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      let isDark = qr.isDark(r, c);
      if (maskCenter && r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) {
        isDark = false; // Simulating logo overlay
      }
      const val = isDark ? 0 : 255;
      for (let y = 0; y < scale; y++) {
        for (let x = 0; x < scale; x++) {
          const idx = ((r * scale + y) * size + (c * scale + x)) * 4;
          data[idx] = val;
          data[idx + 1] = val;
          data[idx + 2] = val;
          data[idx + 3] = 255;
        }
      }
    }
  }

  const result = jsQR(data, size, size);
  return result ? result.data : null;
}

describe('Direct QR Encoding & Decoding Verification', () => {
  test('decodes direct Link URL without proxy or intermediary redirects', () => {
    const rawUrl = 'https://qro.anwincm.dev/portfolio';
    const decoded = decodeQrMatrix(rawUrl, 'Q');
    expect(decoded).toBe(rawUrl);
  });

  test('decodes plain text payload verbatim', () => {
    const rawText = 'Antigravity Verified Clean Code 2026';
    const decoded = decodeQrMatrix(rawText, 'Q');
    expect(decoded).toBe(rawText);
  });

  test('decodes Wi-Fi network configuration format directly', () => {
    const wifiString = 'WIFI:T:WPA;S:StudioGuest;P:HighSecurityPassword2026;;';
    const decoded = decodeQrMatrix(wifiString, 'Q');
    expect(decoded).toBe(wifiString);
  });

  test('decodes multi-line vCard contact data accurately', () => {
    const vCardString = 'BEGIN:VCARD\nVERSION:3.0\nFN:Anwin C M\nTEL:+1234567890\nEMAIL:anwincm8@gmail.com\nEND:VCARD';
    const decoded = decodeQrMatrix(vCardString, 'Q');
    expect(decoded).toBe(vCardString);
  });

  test('preserves scan reliability under Level H error correction with center logo overlay', () => {
    const targetUrl = 'https://qro.anwincm.dev';
    const decoded = decodeQrMatrix(targetUrl, 'H', true);
    expect(decoded).toBe(targetUrl);
  });
});
