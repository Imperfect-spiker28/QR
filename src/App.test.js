import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App, { DEFAULT_ANWIN_LOGO } from './App';

// Mock qr-code-styling to avoid canvas rendering issues in JSDOM
jest.mock('qr-code-styling', () => {
  return class MockQRCodeStyling {
    constructor() {
      this.append = jest.fn();
      this.update = jest.fn();
      this.getRawData = jest.fn().mockResolvedValue(new Blob(['mock-qr-bytes'], { type: 'image/png' }));
      this.download = jest.fn();
    }
  };
});

describe('QRo Application - Final Production Verification', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia =
      window.matchMedia ||
      function () {
        return {
          matches: false,
          addListener: function () {},
          removeListener: function () {},
        };
      };
  });

  test('Navbar renders without Sign In, Get Started, Account buttons or PRO badge', () => {
    render(<App />);

    // Verify removed account UI
    expect(screen.queryByText(/Sign In/i)).toBeNull();
    expect(screen.queryByText(/Get Started/i)).toBeNull();
    expect(screen.queryByText(/Account & License/i)).toBeNull();
    expect(screen.queryByText(/^PRO$/i)).toBeNull();

    // Verify required navbar items: Logo, Generator, Templates, FAQ, Blog
    expect(screen.getAllByText('QRo').length).toBeGreaterThan(0);
    expect(screen.getByText('Generator')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();

    // Theme toggle switch must exist
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  test('Default Anwin logo is loaded automatically and no remove button is shown for default logo', () => {
    render(<App />);

    // Verify Default Logo tag is present
    expect(screen.getByText('Default Logo')).toBeInTheDocument();

    // Verify preview image contains Anwin logo
    const logoImg = screen.getByAltText('Default Anwin Logo');
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', DEFAULT_ANWIN_LOGO);

    // Verify NO red cross or remove button is displayed for default logo
    expect(screen.queryByRole('button', { name: /remove.*logo/i })).toBeNull();
  });

  test('Custom logo upload, replacement confirmation, cancellation, and removal back to Anwin default', async () => {
    render(<App />);

    const file1 = new File(['image-bytes-1'], 'custom-logo-1.png', { type: 'image/png' });
    const file2 = new File(['image-bytes-2'], 'custom-logo-2.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();

    // 1. Upload first custom logo when default logo is active -> applies immediately, zero dialog
    fireEvent.change(fileInput, { target: { files: [file1] } });
    await waitFor(() => {
      expect(screen.queryByText(/Replace the current logo\?/i)).toBeNull();
      expect(screen.getByRole('button', { name: /remove custom logo and restore default anwin logo/i })).toBeInTheDocument();
    });

    // 2. Upload second custom logo when custom logo is active -> triggers confirmation dialog
    fireEvent.change(fileInput, { target: { files: [file2] } });
    await waitFor(() => {
      expect(screen.getByText('Replace the current logo?')).toBeInTheDocument();
      expect(screen.getByText('Your current custom logo will be replaced with the newly selected logo.')).toBeInTheDocument();
    });

    // 3. Click Cancel -> preserves existing custom logo, closes dialog
    const cancelBtn = screen.getByRole('button', { name: /^cancel$/i });
    fireEvent.click(cancelBtn);
    await waitFor(() => {
      expect(screen.queryByText('Replace the current logo?')).toBeNull();
      expect(screen.getByRole('button', { name: /remove custom logo and restore default anwin logo/i })).toBeInTheDocument();
    });

    // 4. Click Remove Logo -> restores default Anwin logo
    const removeBtn = screen.getByRole('button', { name: /remove custom logo and restore default anwin logo/i });
    fireEvent.click(removeBtn);
    await waitFor(() => {
      expect(screen.getByText('Default Logo')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /remove custom logo/i })).toBeNull();
    });
  });

  test('Wi-Fi content type supports password visibility toggle and plain-text warning', () => {
    render(<App />);

    // Switch to Wi-Fi
    const wifiTab = screen.getByRole('button', { name: /wi-fi/i });
    fireEvent.click(wifiTab);

    // Verify inputs: Network Name, Password, Encryption
    expect(screen.getByPlaceholderText(/Wi-Fi Network Name \(SSID\)/i)).toBeInTheDocument();
    const passwordInput = screen.getByPlaceholderText(/Wi-Fi Password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Toggle password visibility
    const togglePasswordBtn = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(togglePasswordBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Verify plain-text security notice is visible
    expect(screen.getByText(/Anyone who scans this QR code will see your Wi-Fi credentials in plain text/i)).toBeInTheDocument();
  });

  test('Contact content type supports all vCard fields (Name, Phone, Email, Org, URL)', () => {
    render(<App />);

    // Switch to Contact
    const contactTab = screen.getByRole('button', { name: /^contact$/i });
    fireEvent.click(contactTab);

    // Verify fields
    expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Organization \/ Company/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Website URL/i)).toBeInTheDocument();
  });

  test('Contrast badge does not make false 100% scan guarantee claims', () => {
    render(<App />);

    // Ensure no "100% scan reliability" or "Camera Scan Verified" in contrast badges
    expect(screen.queryByText(/100% scan reliability/i)).toBeNull();
    expect(screen.queryByText(/Camera Scan Verified/i)).toBeNull();
  });

  test('Caption color picker and font selector are present in Frame & Caption section', () => {
    render(<App />);

    // Enable caption frame toggle
    const frameCheckbox = screen.getByRole('checkbox', { name: /toggle frame & caption/i });
    if (!frameCheckbox.checked) {
      fireEvent.click(frameCheckbox);
    }

    // Color picker button with caption color
    const captionColorBtn = screen.getByRole('button', { name: /change caption color/i });
    expect(captionColorBtn).toBeInTheDocument();

    // Font selector button
    const fontSelector = screen.getByRole('button', { name: /select caption font/i });
    expect(fontSelector).toBeInTheDocument();
  });

  test('Switching themes preserves the default Anwin logo without resetting', () => {
    render(<App />);

    const themeToggleBtn = screen.getByRole('button', { name: /toggle theme/i });
    // Switch to light theme
    fireEvent.click(themeToggleBtn);
    expect(screen.getByText('Default Logo')).toBeInTheDocument();

    // Switch back to dark theme
    fireEvent.click(themeToggleBtn);
    expect(screen.getByText('Default Logo')).toBeInTheDocument();
  });
});
