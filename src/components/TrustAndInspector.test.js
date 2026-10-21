import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrustSection from './TrustSection';
import RawDataInspector from './RawDataInspector';

describe('TrustSection Component', () => {
  test('renders headline with accurate no-middleman messaging', () => {
    render(<TrustSection />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent(/Your QR\. Your destination\./i);
    expect(heading).toHaveTextContent(/No middleman\./i);
  });

  test('explains direct encoding, no subscription expiration, and destination realities', () => {
    render(<TrustSection />);
    expect(screen.getByText(/Direct Matrix Encoding/i)).toBeInTheDocument();
    expect(screen.getByText(/No Subscription Expiration/i)).toBeInTheDocument();
    expect(screen.getByText(/Fixed Once Printed/i)).toBeInTheDocument();
    expect(screen.getByText(/No Inherent Scan Tracking/i)).toBeInTheDocument();
  });
});

describe('RawDataInspector Component', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  test('renders toggle button with accessible aria attributes', () => {
    render(<RawDataInspector payload="https://example.com" contentType="link" />);
    const toggleBtn = screen.getByRole('button', { name: /view exact encoded qr data inspector/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('toggles inspection panel and displays exact payload and character count', () => {
    render(<RawDataInspector payload="https://qro.anwincm.dev/test" contentType="link" />);
    const toggleBtn = screen.getByRole('button', { name: /view exact encoded qr data inspector/i });
    fireEvent.click(toggleBtn);

    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/https:\/\/qro\.anwincm\.dev\/test/)).toBeInTheDocument();
    expect(screen.getByText(/28 characters/i)).toBeInTheDocument();
  });

  test('copies payload to clipboard on button click', async () => {
    render(<RawDataInspector payload="WIFI:T:WPA;S:MyNet;P:Secret;;" contentType="wifi" />);
    const toggleBtn = screen.getByRole('button', { name: /view exact encoded qr data inspector/i });
    fireEvent.click(toggleBtn);

    const copyBtn = screen.getByRole('button', { name: /copy exact encoded payload to clipboard/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('WIFI:T:WPA;S:MyNet;P:Secret;;');
    await waitFor(() => {
      expect(screen.getByText(/copied!/i)).toBeInTheDocument();
    });
  });

  test('displays sensitive information warning for Wi-Fi and Contact payloads', () => {
    const { rerender } = render(
      <RawDataInspector payload="WIFI:T:WPA;S:Office;P:Pass;;" contentType="wifi" />
    );
    fireEvent.click(screen.getByRole('button', { name: /view exact encoded qr data inspector/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Sensitive Content Warning/i);

    rerender(
      <RawDataInspector payload="https://example.com" contentType="link" />
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test('handles empty payload gracefully with informative fallback', () => {
    render(<RawDataInspector payload="" contentType="text" />);
    fireEvent.click(screen.getByRole('button', { name: /view exact encoded qr data inspector/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/No payload generated yet/i);
  });
});
