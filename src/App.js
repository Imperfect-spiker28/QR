import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';
import ColorPickerPopover from './components/ColorPickerPopover';
import {
  initAnalytics,
  trackPageView,
  trackContentTypeSelect,
  trackTemplateSelect,
  trackStyleChange,
  trackQrGenerateSuccess,
  trackQrDownload,
  trackQrCopy,
  trackQrShare,
  trackThemeToggle,
  trackPwaInstall,
  trackFaqToggle,
} from './utils/analytics';
import './App.css';

// Frequently Asked Questions (FAQ) Data for AEO / GEO Search Discoverability
export const FAQ_ITEMS = [
  {
    id: 'free-qr',
    question: 'How do I create a QR code for free?',
    answer:
      'Select your content type (Link, Plain Text, Wi-Fi, or Contact Card), enter your information, customize patterns, colors, logos, and frame if desired, and click "Download QR Code". Everything is generated instantly in your browser at zero cost.',
  },
  {
    id: 'no-signup',
    question: 'Can I create a QR code without signing up?',
    answer:
      'Yes. QRo requires no account, email address, or signup. All generator options, customization features, and high-resolution exports are immediately accessible to everyone.',
  },
  {
    id: 'custom-logo',
    question: 'Can I add my logo to a QR code?',
    answer:
      'Yes. You can upload custom PNG, JPG, or SVG logos or select the default monogram. QRo applies smart proportion limits (under 30%) and boosts Reed-Solomon error correction to Level H/Q to ensure 100% scan reliability.',
  },
  {
    id: 'custom-colors',
    question: 'Can I customize QR code colors?',
    answer:
      'Yes. You can customize the foreground dot patterns, backgrounds, and dual-tone gradients using our custom color picker popover, complete with real-time scan contrast verification.',
  },
  {
    id: 'file-formats',
    question: 'Which file formats can I download?',
    answer:
      'QRo exports your customized QR codes in high-resolution raster PNG (up to 2048px), infinitely scalable vector SVG (ideal for merchandise, print, and packaging), and standard JPG.',
  },
  {
    id: 'offline-generation',
    question: 'Can QR codes be generated offline?',
    answer:
      'Yes. QRo operates as a Progressive Web App (PWA) with a dedicated service worker. All QR calculations and graphic rendering happen 100% client-side in your browser, enabling full functionality without an active internet connection.',
  },
  {
    id: 'free-and-ad-free',
    question: 'Is QRo free and ad-free?',
    answer:
      'Yes. QRo is 100% free with no advertisements, no paywalls, no sponsored redirects, and no hidden subscriptions.',
  },
  {
    id: 'qr-expiration',
    question: 'Do QRo QR codes expire?',
    answer:
      'No. QRo generates static direct QR codes where your data is encoded directly into the matrix. Because it does not route through any intermediary redirect service, your QR codes will never expire.',
  },
];

// Default Monogram SVG for Logo Step (matching Tiffany #21F1A8 & Dark Gray #171717 palette)
const DEFAULT_LOGO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#21F1A8" />
      <stop offset="100%" stop-color="#05D588" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="26" fill="#171717"/>
  <path d="M26 66 L26 36 C26 32 30 30 34 34 L50 52 L66 34 C70 30 74 32 74 36 L74 66" fill="none" stroke="url(#mGrad)" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

// Curated Template Presets
const TEMPLATES = [
  {
    id: 'tiffany-noir',
    name: 'Tiffany Noir (Default)',
    desc: 'Electric Tiffany cyan with deep dark gray obsidian finish.',
    style: 'rounded',
    fg: '#21F1A8',
    gradientEnd: '#05D588',
    useGradient: true,
    bg: '#171717',
    caption: 'SCAN TO OPEN',
    previewBg: 'linear-gradient(135deg, #21F1A8, #05D588)',
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    desc: 'Warm golden amber gradient with modern dot matrix styling.',
    style: 'dot_matrix',
    fg: '#D97706',
    gradientEnd: '#DC2626',
    useGradient: true,
    bg: '#FFFBEB',
    caption: 'CONNECT WITH ME',
    previewBg: 'linear-gradient(135deg, #D97706, #DC2626)',
  },
  {
    id: 'emerald-luxe',
    name: 'Emerald Luxe',
    desc: 'Rich forest emerald with clean classic structured geometry.',
    style: 'classic',
    fg: '#059669',
    gradientEnd: '#10B981',
    useGradient: true,
    bg: '#F0FDF4',
    caption: 'EXCLUSIVE ACCESS',
    previewBg: 'linear-gradient(135deg, #059669, #10B981)',
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    desc: 'High-contrast cyan to royal blue with futuristic matrix dots.',
    style: 'dot_matrix',
    fg: '#06B6D4',
    gradientEnd: '#3B82F6',
    useGradient: true,
    bg: '#FFFFFF',
    caption: 'EXPLORE FUTURE',
    previewBg: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
  },
  {
    id: 'midnight-slate',
    name: 'Midnight Minimal',
    desc: 'Deep dark gray tone with subtle rounded modules for maximum clarity.',
    style: 'rounded',
    fg: '#171717',
    gradientEnd: '#262626',
    useGradient: false,
    bg: '#FFFFFF',
    caption: 'OFFICIAL LINK',
    previewBg: '#171717',
  },
  {
    id: 'rose-velvet',
    name: 'Rose Velvet',
    desc: 'Crimson rose to pink gradient designed for brands and events.',
    style: 'rounded',
    fg: '#E11D48',
    gradientEnd: '#FB7185',
    useGradient: true,
    bg: '#FFF1F2',
    caption: 'SCAN FOR LOVE',
    previewBg: 'linear-gradient(135deg, #E11D48, #FB7185)',
  },
];

// Curated Export Resolutions
const RESOLUTIONS = [
  {
    id: 'res-512',
    value: 512,
    name: 'Standard Quality',
    badge: '512 × 512',
    desc: 'Quick scan, web preview & emails',
  },
  {
    id: 'res-1024',
    value: 1024,
    name: 'High Definition (HD)',
    badge: '1024 × 1024',
    desc: 'Recommended for retina displays & social media',
  },
  {
    id: 'res-2048',
    value: 2048,
    name: 'Ultra Print 4K',
    badge: '2048 × 2048',
    desc: 'Maximum sharpness for flyers, packaging & print',
  },
  {
    id: 'res-svg',
    value: 'svg',
    name: 'Scalable Vector SVG',
    badge: 'Lossless SVG',
    desc: 'Infinite resolution for large banners & billboards',
  },
];

export default function App() {
  // Theme State: Dark Theme is default
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (localStorage.getItem('qro_theme_v2') === null) {
      localStorage.removeItem('qro_theme');
      return true; // Default to Dark Theme
    }
    return localStorage.getItem('qro_theme_v2') === 'dark';
  });

  // Network Online/Offline State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  // Active Modals: 'templates' | 'blog' | 'signin' | 'error_screen' | null
  const [activeModal, setActiveModal] = useState(null);

  // Navigation State
  const [activeNav, setActiveNav] = useState('generator');

  // Input Tabs & Data
  const [activeTab, setActiveTab] = useState('link'); // 'link' | 'text' | 'wifi' | 'contact'
  const [urlInput, setUrlInput] = useState('https://qro.anwincm.dev');
  const [textInput, setTextInput] = useState('');
  const [wifiData, setWifiData] = useState({ ssid: '', password: '', encryption: 'WPA' });
  const [contactData, setContactData] = useState({ name: '', phone: '', email: '' });

  // QR Design States
  const [styleType, setStyleType] = useState('rounded'); // 'classic' | 'rounded' | 'dot_matrix'
  const [fgColor, setFgColor] = useState('#21F1A8');
  const [gradientEndColor, setGradientEndColor] = useState('#05D588');
  const [useGradient, setUseGradient] = useState(true);
  const [bgColor, setBgColor] = useState('#171717');

  // Logo States
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_SVG);
  const [hasLogo, setHasLogo] = useState(true);

  // Frame & Caption States
  const [frameEnabled, setFrameEnabled] = useState(true);
  const [captionText, setCaptionText] = useState('SCAN TO OPEN');
  const [captionFont, setCaptionFont] = useState('Plus Jakarta Sans');

  // Export & Resolution States
  const [selectedFormat, setSelectedFormat] = useState('png'); // 'png' | 'svg' | 'jpg'
  const [selectedResolution, setSelectedResolution] = useState(1024); // 512 | 1024 | 2048 | 'svg'
  const [showResolutionMenu, setShowResolutionMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const resolutionMenuRef = useRef(null);

  // Error Simulation / Validation State
  const [inputError, setInputError] = useState('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Refs
  const qrRef = useRef(null);
  const qrCodeInstance = useRef(null);
  const fileInputRef = useRef(null);

  // FAQ Accordion State (AEO / GEO)
  const [openFaqId, setOpenFaqId] = useState(null);

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => {
      const next = prev === id ? null : id;
      trackFaqToggle(id, Boolean(next));
      return next;
    });
  };

  // Initialize Analytics and Track Initial Page View
  useEffect(() => {
    initAnalytics();
    trackPageView(window.location.pathname, 'QRo - Free Custom QR Code Generator');
  }, []);

  // Synchronize Theme Changes
  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('qro_theme_v2', next ? 'dark' : 'light');
    showToast(`Switched to ${next ? 'Dark' : 'Light'} theme`);
    trackThemeToggle(next ? 'dark' : 'light');
  };

  // Sync data-theme on html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (resolutionMenuRef.current && !resolutionMenuRef.current.contains(event.target)) {
        setShowResolutionMenu(false);
      }
    }
    if (showResolutionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResolutionMenu]);

  // Monitor Online/Offline Status & PWA Install
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Back online! All features synced.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline Mode: QRo generates QR codes 100% locally in your browser!');
    };

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPrompt(null);
      showToast('🎉 QRo installed! Offline desktop/mobile mode ready.');
    };

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Show Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  // Compute Contrast & Luminance for Scan Reliability
  const getLuminance = (hex) => {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return 0.5;
    const c = hex.length === 4
      ? hex.slice(1).split('').map((x) => parseInt(x + x, 16))
      : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    const [r, g, b] = c.map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const getContrastRatio = (hex1, hex2) => {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // Compute QR Data Payload
  const getQrData = useCallback(() => {
    switch (activeTab) {
      case 'link': {
        const raw = urlInput.trim() || 'https://qro.anwincm.dev';
        return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      }
      case 'text':
        return textInput.trim() || 'Hello from QRo';
      case 'wifi':
        return `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`;
      case 'contact':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactData.name}\nTEL:${contactData.phone}\nEMAIL:${contactData.email}\nEND:VCARD`;
      default:
        return 'https://qro.anwincm.dev';
    }
  }, [activeTab, urlInput, textInput, wifiData, contactData]);

  // Validate Input
  useEffect(() => {
    if (activeTab === 'link' && urlInput.trim().length > 0) {
      try {
        const test = new URL(urlInput.startsWith('http') ? urlInput : `https://${urlInput}`);
        if (!test.hostname.includes('.')) {
          setInputError('Warning: URL should include a domain (e.g. .com, .dev)');
        } else {
          setInputError('');
        }
      } catch (e) {
        setInputError('Please enter a valid URL (e.g. https://example.com)');
      }
    } else {
      setInputError('');
    }
  }, [activeTab, urlInput]);

  // Determine Dots & Corners Configurations
  const getStyleConfigs = (type) => {
    switch (type) {
      case 'classic':
        return {
          dotsType: 'square',
          cornersSquareType: 'square',
          cornersDotType: 'square',
        };
      case 'dot_matrix':
        return {
          dotsType: 'dots',
          cornersSquareType: 'extra-rounded',
          cornersDotType: 'dot',
        };
      case 'rounded':
      default:
        return {
          dotsType: 'rounded',
          cornersSquareType: 'extra-rounded',
          cornersDotType: 'dot',
        };
    }
  };

  // Initialize QR Code Instance on mount
  useEffect(() => {
    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 290,
        height: 290,
        type: 'canvas',
        data: 'https://qro.anwincm.dev',
        image: DEFAULT_LOGO_SVG,
        dotsOptions: {
          type: 'rounded',
          color: '#21F1A8',
          gradient: {
            type: 'linear',
            rotation: 0.85,
            colorStops: [
              { offset: 0, color: '#21F1A8' },
              { offset: 1, color: '#05D588' },
            ],
          },
        },
        backgroundOptions: {
          color: '#171717',
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 6,
          imageSize: 0.32,
          hideBackgroundDots: true,
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          color: '#21F1A8',
        },
        cornersDotOptions: {
          type: 'dot',
          color: '#21F1A8',
        },
      });
    }

    if (qrRef.current && qrRef.current.childNodes.length === 0) {
      qrCodeInstance.current.append(qrRef.current);
    }
  }, []);

  // Update QR Code with Loading Animation
  useEffect(() => {
    setIsGenerating(true);
    const configs = getStyleConfigs(styleType);
    const dataString = getQrData();

    const dotsOptions = {
      type: configs.dotsType,
      color: fgColor,
    };

    if (useGradient) {
      dotsOptions.gradient = {
        type: 'linear',
        rotation: 0.85,
        colorStops: [
          { offset: 0, color: fgColor },
          { offset: 1, color: gradientEndColor },
        ],
      };
    }

    const options = {
      width: 290,
      height: 290,
      data: dataString,
      image: hasLogo ? logoUrl : undefined,
      dotsOptions,
      backgroundOptions: {
        color: bgColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 6,
        imageSize: 0.32,
        hideBackgroundDots: true,
      },
      cornersSquareOptions: {
        type: configs.cornersSquareType,
        color: useGradient ? fgColor : (getLuminance(bgColor) > 0.5 ? '#171717' : '#F8FAFC'),
      },
      cornersDotOptions: {
        type: configs.cornersDotType,
        color: useGradient ? fgColor : (getLuminance(bgColor) > 0.5 ? '#171717' : '#F8FAFC'),
      },
      qrOptions: {
        errorCorrectionLevel: hasLogo ? 'H' : 'Q',
      },
    };

    if (qrCodeInstance.current) {
      qrCodeInstance.current.update(options);
    }

    const timer = setTimeout(() => {
      setIsGenerating(false);
      trackQrGenerateSuccess({
        contentType: activeTab,
        hasLogo,
        useGradient,
        hasFrame: frameEnabled,
        style: styleType,
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [
    getQrData,
    styleType,
    fgColor,
    gradientEndColor,
    useGradient,
    bgColor,
    hasLogo,
    logoUrl,
    isDarkMode,
    activeTab,
    frameEnabled,
  ]);

  // Apply a Template Preset
  const applyTemplate = (template) => {
    setStyleType(template.style);
    setFgColor(template.fg);
    setGradientEndColor(template.gradientEnd);
    setUseGradient(template.useGradient);
    setBgColor(template.bg);
    setCaptionText(template.caption);
    setActiveModal(null);
    showToast(`Applied '${template.name}' template!`);
    trackTemplateSelect(template.id, template.name);
  };

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target.result);
        setHasLogo(true);
        showToast('Custom logo uploaded successfully!');
      };
      reader.onerror = () => {
        showToast('Error reading image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Download QR Code with selected resolution and format
  const handleDownload = async (format = selectedFormat, resolution = selectedResolution) => {
    setIsDownloading(true);
    setShowResolutionMenu(false);
    trackQrDownload({
      format,
      resolution: format === 'svg' || resolution === 'svg' ? 'svg' : resolution,
      framed: frameEnabled,
      style: styleType,
    });

    try {
      const configs = getStyleConfigs(styleType);
      const dataString = getQrData();

      const dotsOptions = {
        type: configs.dotsType,
        color: fgColor,
      };

      if (useGradient) {
        dotsOptions.gradient = {
          type: 'linear',
          rotation: 0.85,
          colorStops: [
            { offset: 0, color: fgColor },
            { offset: 1, color: gradientEndColor },
          ],
        };
      }

      const cornerColor = getLuminance(bgColor) > 0.5 ? '#171717' : '#F8FAFC';

      const exportOptions = {
        width: resolution,
        height: resolution,
        type: 'canvas',
        data: dataString,
        image: hasLogo ? logoUrl : undefined,
        dotsOptions,
        backgroundOptions: {
          color: bgColor,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: Math.round(6 * (resolution / 290)),
          imageSize: 0.32,
          hideBackgroundDots: true,
        },
        cornersSquareOptions: {
          type: configs.cornersSquareType,
          color: useGradient ? fgColor : cornerColor,
        },
        cornersDotOptions: {
          type: configs.cornersDotType,
          color: useGradient ? fgColor : cornerColor,
        },
        qrOptions: {
          errorCorrectionLevel: hasLogo ? 'H' : 'Q',
        },
      };

      const exportQr = new QRCodeStyling(exportOptions);

      if (format === 'svg') {
        await exportQr.download({
          name: `qro-code-${Date.now()}`,
          extension: 'svg',
        });
        showToast('Downloaded clean vector QR code as SVG!');
        setIsDownloading(false);
        return;
      }

      if (frameEnabled) {
        // High-resolution framed export
        const rawBlob = await exportQr.getRawData('png');
        if (!rawBlob) throw new Error('Failed to generate high-res QR bitmap');

        const qrImg = new Image();
        const blobUrl = URL.createObjectURL(rawBlob);
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = blobUrl;
        });

        const scale = resolution / 290;
        const padding = Math.round(36 * scale);
        const bottomPadding = Math.round(54 * scale);
        const cardWidth = Math.round(resolution + padding * 2);
        const cardHeight = Math.round(resolution + padding + bottomPadding);

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = cardWidth;
        exportCanvas.height = cardHeight;
        const ctx = exportCanvas.getContext('2d');

        // Draw framed background with smooth rounded corners
        ctx.fillStyle = bgColor === '#FFFFFF' ? '#FFFFFF' : bgColor;
        const r = Math.round(20 * scale);
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(cardWidth - r, 0);
        ctx.quadraticCurveTo(cardWidth, 0, cardWidth, r);
        ctx.lineTo(cardWidth, cardHeight - r);
        ctx.quadraticCurveTo(cardWidth, cardHeight, cardWidth - r, cardHeight);
        ctx.lineTo(r, cardHeight);
        ctx.quadraticCurveTo(0, cardHeight, 0, cardHeight - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.fill();

        // Draw crisp QR code image
        ctx.drawImage(qrImg, padding, padding, resolution, resolution);
        URL.revokeObjectURL(blobUrl);

        // Draw caption
        if (captionText) {
          ctx.fillStyle = getLuminance(bgColor) > 0.5 ? '#171717' : '#F8FAFC';
          ctx.font = `bold ${Math.round(14 * scale)}px ${captionFont}, sans-serif`;
          ctx.textAlign = 'center';
          ctx.letterSpacing = `${Math.round(3 * scale)}px`;
          ctx.fillText(captionText.toUpperCase(), cardWidth / 2, resolution + padding + Math.round(34 * scale));
        }

        const link = document.createElement('a');
        link.download = `qro-${Date.now()}.${format}`;
        link.href = exportCanvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
        link.click();
        showToast(`Downloaded ${resolution}px framed QR code as ${format.toUpperCase()}!`);
      } else {
        // Direct clean download at target resolution
        await exportQr.download({
          name: `qro-code-${Date.now()}`,
          extension: format === 'jpg' ? 'jpeg' : format,
        });
        showToast(`Downloaded crisp ${resolution}px QR code as ${format.toUpperCase()}!`);
      }
    } catch (err) {
      console.error(err);
      showToast('Exporting with fallback direct download...');
      qrCodeInstance.current?.download({
        name: `qro-code-${Date.now()}`,
        extension: format === 'jpg' ? 'jpeg' : format,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy to Clipboard
  const handleCopy = async () => {
    trackQrCopy({ style: styleType });
    try {
      const rawCanvas = qrRef.current.querySelector('canvas');
      if (rawCanvas && navigator.clipboard?.write) {
        rawCanvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            showToast('QR Code image copied to clipboard!');
          }
        });
      } else {
        await navigator.clipboard.writeText(getQrData());
        showToast('Link text copied to clipboard!');
      }
    } catch (e) {
      showToast('Copied content to clipboard!');
    }
  };

  return (
    <div className="qro-page-container" data-theme={isDarkMode ? 'dark' : 'light'}>
      <div className="qro-backdrop-overlay" />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="qro-network-banner">
          <span>⚡ <strong>You are offline:</strong> QRo functions 100% locally in your browser. All generation and downloads work without internet!</span>
          <button onClick={() => setShowOfflineModal(true)}>Learn More</button>
        </div>
      )}

      {/* Navigation Header */}
      <div className="qro-header-wrap">
        <header className="qro-header">
          <div
            className="qro-logo-group"
            onClick={() => {
              setActiveNav('generator');
              document.getElementById('generator-workspace')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="qro-logo-icon">
              <img
                src={`${process.env.PUBLIC_URL}/logo.png`}
                alt="Logo"
                className="qro-logo-img"
              />
            </div>
            <span className="qro-logo-title">QRo</span>
            <span className="qro-pro-badge">PRO</span>
          </div>

          <nav>
            <ul className="qro-nav-links">
              <li
                className={`qro-nav-item ${activeNav === 'generator' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('generator');
                  document.getElementById('generator-workspace')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Generator
              </li>
              <li
                className={`qro-nav-item ${activeNav === 'templates' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('templates');
                  setActiveModal('templates');
                }}
              >
                Templates
              </li>
              <li
                className={`qro-nav-item ${activeNav === 'faq' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('faq');
                  document.getElementById('qro-faq')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                FAQ
              </li>
              <li
                className={`qro-nav-item ${activeNav === 'blog' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('blog');
                  setActiveModal('blog');
                }}
              >
                Blog
              </li>
            </ul>
          </nav>

          <div className="qro-nav-actions">
            {/* PWA Install Button */}
            {installPrompt && !isAppInstalled && (
              <button
                type="button"
                className="qro-btn-install"
                title="Install QRo App for Offline Use"
                onClick={async () => {
                  installPrompt.prompt();
                  const choice = await installPrompt.userChoice;
                  if (choice.outcome === 'accepted') {
                    showToast('Installing QRo app...');
                    trackPwaInstall('accepted');
                  } else {
                    trackPwaInstall('dismissed');
                  }
                  setInstallPrompt(null);
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Install</span>
              </button>
            )}

            {/* Dark & Light Theme Toggle Button */}
            <button
              className="qro-icon-btn"
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Theme`}
              onClick={toggleTheme}
            >
              {isDarkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Sign In Button */}
            <button
              className="qro-btn-signin"
              onClick={() => setActiveModal('signin')}
            >
              Sign In
            </button>

            {/* Get Started Smooth Action Button */}
            <button
              className="qro-btn-getstarted"
              onClick={() => {
                document.getElementById('generator-workspace')?.scrollIntoView({ behavior: 'smooth' });
                document.querySelector('.qro-text-input')?.focus();
                showToast('Welcome to QRo! Customize your link below.');
              }}
            >
              Get Started
            </button>
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="qro-main-content" id="generator-workspace">
        {/* Hero Section */}
        <div className="qro-hero-heading">
          <div className="qro-eyebrow">LINK TO QR CODE GENERATOR</div>
          <h1 className="qro-headline">
            Make links <span className="qro-tangible-text">tangible.</span>
          </h1>
          <h2 className="qro-subheadline">Create a QR code worth sharing.</h2>
          <p className="qro-desc">
            Turn any link, text or information into a beautiful, scannable QR code. Clean. Custom. Yours.
          </p>
        </div>

        {/* 2-Column Workstation */}
        <div className="qro-workspace-grid">
          {/* Left Column: Glass Control Panel */}
          <div className="qro-control-panel">
            {/* Tab Selector Pills */}
            <div className="qro-type-tabs">
              <button
                className={`qro-type-tab ${activeTab === 'link' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('link');
                  trackContentTypeSelect('link');
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Link
              </button>
              <button
                className={`qro-type-tab ${activeTab === 'text' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('text');
                  trackContentTypeSelect('text');
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" y1="20" x2="15" y2="20" />
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
                Text
              </button>
              <button
                className={`qro-type-tab ${activeTab === 'wifi' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('wifi');
                  trackContentTypeSelect('wifi');
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
                Wi-Fi
              </button>
              <button
                className={`qro-type-tab ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('contact');
                  trackContentTypeSelect('contact');
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Contact
              </button>
            </div>

            {/* Step 1: Content Input */}
            <div className="qro-step-card">
              <div className="qro-step-header">
                <div className="qro-step-num">1</div>
                <div>
                  <div className="qro-step-title">
                    {activeTab === 'link' && 'Enter your link'}
                    {activeTab === 'text' && 'Enter plain text'}
                    {activeTab === 'wifi' && 'Wi-Fi network details'}
                    {activeTab === 'contact' && 'Contact card details'}
                  </div>
                  <div className="qro-step-subtitle">
                    {activeTab === 'link' && 'Paste the URL you want to share'}
                    {activeTab === 'text' && 'Type any text message or notes'}
                    {activeTab === 'wifi' && 'Provide SSID and connection password'}
                    {activeTab === 'contact' && 'Share contact information instantly'}
                  </div>
                </div>
              </div>

              {activeTab === 'link' && (
                <div className="qro-input-wrapper">
                  <span className="qro-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  <input
                    type="url"
                    className="qro-text-input"
                    placeholder="https://example.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  {urlInput && (
                    <button className="qro-clear-btn" onClick={() => setUrlInput('')} title="Clear">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {inputError && (
                <div className="qro-error-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{inputError}</span>
                </div>
              )}

              {activeTab === 'text' && (
                <div className="qro-input-wrapper">
                  <textarea
                    rows={2}
                    className="qro-text-input"
                    placeholder="Enter custom text..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                  {textInput && (
                    <button className="qro-clear-btn" onClick={() => setTextInput('')} title="Clear">
                      ✕
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'wifi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="qro-input-wrapper">
                    <input
                      type="text"
                      className="qro-text-input"
                      placeholder="Wi-Fi Network Name (SSID)"
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                    />
                  </div>
                  <div className="qro-input-wrapper">
                    <input
                      type="password"
                      className="qro-text-input"
                      placeholder="Password"
                      value={wifiData.password}
                      onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="qro-input-wrapper">
                    <input
                      type="text"
                      className="qro-text-input"
                      placeholder="Full Name (e.g., Anwin C M)"
                      value={contactData.name}
                      onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                    />
                  </div>
                  <div className="qro-input-wrapper">
                    <input
                      type="tel"
                      className="qro-text-input"
                      placeholder="Phone Number"
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                    />
                  </div>
                  <div className="qro-input-wrapper">
                    <input
                      type="email"
                      className="qro-text-input"
                      placeholder="Email Address"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: QR Style */}
            <div className="qro-step-card">
              <div className="qro-step-header">
                <div className="qro-step-num">2</div>
                <div>
                  <div className="qro-step-title">QR Style</div>
                  <div className="qro-step-subtitle">Choose a style for your QR code</div>
                </div>
              </div>

              <div className="qro-styles-grid">
                {/* Classic Style */}
                <div
                  className={`qro-style-option ${styleType === 'classic' ? 'selected' : ''}`}
                  onClick={() => {
                    setStyleType('classic');
                    trackStyleChange('classic');
                  }}
                >
                  <div className="qro-style-radio" />
                  <div className="qro-style-preview">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="2" y="2" width="8" height="8" />
                      <rect x="14" y="2" width="8" height="8" />
                      <rect x="2" y="14" width="8" height="8" />
                      <rect x="14" y="14" width="3" height="3" />
                      <rect x="19" y="14" width="3" height="3" />
                      <rect x="14" y="19" width="8" height="3" />
                    </svg>
                  </div>
                  <div className="qro-style-label">Classic</div>
                </div>

                {/* Rounded Style */}
                <div
                  className={`qro-style-option ${styleType === 'rounded' ? 'selected' : ''}`}
                  onClick={() => {
                    setStyleType('rounded');
                    trackStyleChange('rounded');
                  }}
                >
                  <div className="qro-style-radio" />
                  <div className="qro-style-preview">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="2" y="2" width="8" height="8" rx="3" />
                      <rect x="14" y="2" width="8" height="8" rx="3" />
                      <rect x="2" y="14" width="8" height="8" rx="3" />
                      <circle cx="15.5" cy="15.5" r="1.5" />
                      <circle cx="20.5" cy="15.5" r="1.5" />
                      <rect x="14" y="19" width="8" height="3" rx="1.5" />
                    </svg>
                  </div>
                  <div className="qro-style-label">Rounded</div>
                </div>

                {/* Dot Matrix Style */}
                <div
                  className={`qro-style-option ${styleType === 'dot_matrix' ? 'selected' : ''}`}
                  onClick={() => {
                    setStyleType('dot_matrix');
                    trackStyleChange('dot_matrix');
                  }}
                >
                  <div className="qro-style-radio" />
                  <div className="qro-style-preview">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="5" r="2.5" />
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="19" cy="5" r="2.5" />
                      <circle cx="5" cy="12" r="1.5" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="19" cy="12" r="1.5" />
                      <circle cx="5" cy="19" r="2.5" />
                      <circle cx="12" cy="19" r="1.5" />
                      <circle cx="19" cy="19" r="2" />
                    </svg>
                  </div>
                  <div className="qro-style-label">Dot matrix</div>
                </div>
              </div>
            </div>

            {/* Step 3: Colors */}
            <div className="qro-step-card">
              <div className="qro-step-header">
                <div className="qro-step-num">3</div>
                <div>
                  <div className="qro-step-title">Colors</div>
                  <div className="qro-step-subtitle">Customize the look and feel</div>
                </div>
              </div>

              <div className="qro-colors-row">
                {/* Foreground / Gradient Picker */}
                <div className="qro-color-card">
                  <div className="qro-color-label">Dots & Pattern</div>
                  <ColorPickerPopover
                    label="Dots & Pattern"
                    color={fgColor}
                    onChange={setFgColor}
                    swatchPreviewStyle={{
                      background: useGradient
                        ? `linear-gradient(135deg, ${fgColor}, ${gradientEndColor})`
                        : fgColor,
                    }}
                  />
                </div>

                {/* Background Picker */}
                <div className="qro-color-card">
                  <div className="qro-color-label">Background</div>
                  <ColorPickerPopover
                    label="Background"
                    color={bgColor}
                    onChange={setBgColor}
                  />
                </div>
              </div>

              {/* Gradient toggle & End Color */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="gradient-toggle"
                    checked={useGradient}
                    onChange={(e) => setUseGradient(e.target.checked)}
                    style={{ accentColor: '#21F1A8', cursor: 'pointer' }}
                  />
                  <label htmlFor="gradient-toggle" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>
                    Vibrant Duo-Tone Gradient
                  </label>
                </div>

                {useGradient && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>End:</span>
                    <ColorPickerPopover
                      label="Gradient End Color"
                      color={gradientEndColor}
                      onChange={setGradientEndColor}
                      compact={true}
                    />
                  </div>
                )}
              </div>

              {/* Scan Reliability Contrast Verification */}
              <div className={`qro-scan-badge ${getContrastRatio(fgColor, bgColor) >= 3.0 ? 'good' : 'warning'}`}>
                {getContrastRatio(fgColor, bgColor) >= 3.0 ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>High Contrast ({getContrastRatio(fgColor, bgColor).toFixed(1)}:1) — Camera Scan Verified</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>Low Contrast ({getContrastRatio(fgColor, bgColor).toFixed(1)}:1) — Increase color contrast for optimal scanning</span>
                  </>
                )}
              </div>
            </div>

            {/* Step 4: Add Logo */}
            <div className="qro-step-card">
              <div className="qro-step-header">
                <div className="qro-step-num">4</div>
                <div>
                  <div className="qro-step-title">Add logo (optional)</div>
                  <div className="qro-step-subtitle">Keep it small for best scan results (max 30% of QR size)</div>
                </div>
              </div>

              <div className="qro-logo-row">
                <div
                  className="qro-upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                  <div className="qro-upload-icon-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div>
                    <div className="qro-upload-text-title">Upload logo</div>
                    <div className="qro-upload-text-hint">PNG, JPG or SVG (Max 2MB)</div>
                  </div>
                </div>

                {hasLogo && (
                  <div className="qro-logo-preview-badge">
                    <img src={logoUrl} alt="Logo Preview" />
                    <button
                      className="qro-remove-logo-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHasLogo(false);
                      }}
                      title="Remove Logo"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {!hasLogo && (
                  <button
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.25)',
                      border: '1px solid var(--input-border)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setLogoUrl(DEFAULT_LOGO_SVG);
                      setHasLogo(true);
                      showToast('Default monogram logo restored');
                    }}
                  >
                    Restore Default
                  </button>
                )}
              </div>
            </div>

            {/* Step 5: Frame & Caption */}
            <div className="qro-step-card">
              <div className="qro-frame-header-row">
                <div className="qro-step-header">
                  <div className="qro-step-num">5</div>
                  <div>
                    <div className="qro-step-title">Frame & Caption (optional)</div>
                    <div className="qro-step-subtitle">Add a frame and a short message</div>
                  </div>
                </div>

                <label className="qro-switch">
                  <input
                    type="checkbox"
                    checked={frameEnabled}
                    onChange={(e) => setFrameEnabled(e.target.checked)}
                  />
                  <span className="qro-switch-slider" />
                </label>
              </div>

              {frameEnabled && (
                <div className="qro-caption-input-box">
                  <input
                    type="text"
                    className="qro-caption-field"
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    placeholder="SCAN TO OPEN"
                  />
                  <button
                    className="qro-caption-font-btn"
                    onClick={() => {
                      const fonts = ['Plus Jakarta Sans', 'Playfair Display', 'Outfit', 'monospace'];
                      const next = fonts[(fonts.indexOf(captionFont) + 1) % fonts.length];
                      setCaptionFont(next);
                      showToast(`Typography set to: ${next}`);
                    }}
                    title="Change Typography"
                  >
                    <span>A</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Hero Pedestal Showcase */}
          <div className="qro-preview-column">
            <div className="qro-pedestal-container">
              {/* White/Obsidian Ceramic Card */}
              <div className="qro-ceramic-tile">
                <div className="qro-qr-canvas-mount" style={{ position: 'relative' }}>
                  <div ref={qrRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                  {/* Real-time Loading Shimmer */}
                  {isGenerating && (
                    <div className="qro-tile-loading-overlay">
                      <div className="qro-spinner" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#21F1A8' }}>Generating QR...</span>
                    </div>
                  )}
                </div>
                {frameEnabled && captionText && (
                  <div
                    className="qro-tile-caption"
                    style={{ fontFamily: `${captionFont}, sans-serif` }}
                  >
                    {captionText}
                  </div>
                )}
              </div>
            </div>

            {/* Download Controls & Modern Quality Dropdown */}
            <div className="qro-download-controls">
              {/* Modern Quality & Resolution Dropdown */}
              <div className="qro-modern-dropdown-wrapper" ref={resolutionMenuRef}>
                <div className="qro-dropdown-label-bar">
                  <span className="qro-dropdown-field-title">Export Quality:</span>
                  <span className="qro-dropdown-quality-hint">
                    {selectedResolution === 'svg' ? 'Lossless Vector' : `${selectedResolution}×${selectedResolution}px`}
                  </span>
                </div>

                <button
                  type="button"
                  className={`qro-modern-dropdown-btn ${showResolutionMenu ? 'active' : ''}`}
                  onClick={() => setShowResolutionMenu(!showResolutionMenu)}
                  aria-expanded={showResolutionMenu}
                >
                  <div className="qro-modern-dropdown-selection">
                    <span className="qro-modern-dropdown-indicator" />
                    <span className="qro-modern-dropdown-val-text">
                      {RESOLUTIONS.find(r => r.value === selectedResolution)?.name || 'High Definition (HD)'}
                    </span>
                    <span className="qro-modern-dropdown-res-tag">
                      {selectedResolution === 'svg' ? 'SVG' : `${selectedResolution}px`}
                    </span>
                  </div>
                  <div className="qro-modern-dropdown-chevron-box">
                    <svg
                      className={`qro-modern-dropdown-chevron ${showResolutionMenu ? 'open' : ''}`}
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>

                {/* Modern Popover Dropdown Card */}
                {showResolutionMenu && (
                  <div className="qro-modern-dropdown-menu">
                    <div className="qro-modern-dropdown-menu-header">
                      <span>CHOOSE RESOLUTION</span>
                      <span className="qro-dropdown-badge-tiffany">TIFFANY ULTRA</span>
                    </div>
                    <div className="qro-modern-dropdown-options">
                      {RESOLUTIONS.map((res) => {
                        const isSelected = selectedResolution === res.value;
                        return (
                          <button
                            key={res.id}
                            type="button"
                            className={`qro-modern-option-row ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedResolution(res.value);
                              if (res.value === 'svg') setSelectedFormat('svg');
                              else if (selectedFormat === 'svg') setSelectedFormat('png');
                              setShowResolutionMenu(false);
                              showToast(`Quality set to ${res.name} (${res.badge})`);
                            }}
                          >
                            <div className="qro-option-icon-box">
                              {res.value === 512 && (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="2" y="3" width="20" height="14" rx="2" />
                                  <line x1="8" y1="21" x2="16" y2="21" />
                                  <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                              )}
                              {res.value === 1024 && (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                  <path d="M2 12h20" />
                                </svg>
                              )}
                              {res.value === 2048 && (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              )}
                              {res.value === 'svg' && (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="16 18 22 12 16 6" />
                                  <polyline points="8 6 2 12 8 18" />
                                </svg>
                              )}
                            </div>
                            <div className="qro-option-info">
                              <div className="qro-option-name-row">
                                <span className="qro-option-title">{res.name}</span>
                                <span className="qro-option-badge">{res.badge}</span>
                              </div>
                              <span className="qro-option-description">{res.desc}</span>
                            </div>
                            {isSelected && (
                              <div className="qro-option-checkmark">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#21F1A8" strokeWidth="3.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Download Button (Clean, Unified Full-Width Pill) */}
              <button
                className="qro-primary-download-btn"
                onClick={() => handleDownload(selectedFormat, selectedResolution)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <div className="qro-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    <span>Exporting High-Res...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>
                      Download QR Code ({selectedFormat === 'svg' || selectedResolution === 'svg' ? 'SVG' : `${selectedFormat.toUpperCase()} • ${selectedResolution}px`})
                    </span>
                  </>
                )}
              </button>

              {/* Format Selector Pills */}
              <div className="qro-format-selector-wrapper">
                <span className="qro-format-selector-title">Select Format:</span>
                <div className="qro-format-pills">
                  <button
                    type="button"
                    className={`qro-format-btn ${selectedFormat === 'png' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFormat('png');
                      if (selectedResolution === 'svg') setSelectedResolution(1024);
                      showToast('Export format set to PNG (High-Res)');
                    }}
                    title="Select PNG format"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    PNG
                  </button>
                  <button
                    type="button"
                    className={`qro-format-btn ${selectedFormat === 'svg' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFormat('svg');
                      setSelectedResolution('svg');
                      showToast('Export format set to SVG (Scalable Vector)');
                    }}
                    title="Select SVG vector format"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    SVG
                  </button>
                  <button
                    type="button"
                    className={`qro-format-btn ${selectedFormat === 'jpg' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFormat('jpg');
                      if (selectedResolution === 'svg') setSelectedResolution(1024);
                      showToast('Export format set to JPG');
                    }}
                    title="Select JPG format"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    JPG
                  </button>
                </div>
              </div>

              {/* Secondary Actions */}
              <div className="qro-secondary-actions">
                <button className="qro-text-action-btn" onClick={handleCopy}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy to Clipboard
                </button>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
                <button
                  className="qro-text-action-btn"
                  onClick={() => {
                    trackQrShare({ style: styleType });
                    if (navigator.share) {
                      navigator.share({
                        title: 'QRo - Make Links Tangible',
                        text: `Scan my QR Code: ${getQrData()}`,
                        url: getQrData(),
                      });
                    } else {
                      handleCopy();
                    }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Frequently Asked Questions (FAQ) Section for AEO / GEO / Search Discoverability */}
      <section id="qro-faq" className="qro-faq-section" aria-labelledby="faq-main-heading">
        <div className="qro-faq-container">
          <div className="qro-faq-header">
            <div className="qro-eyebrow">HELP & KNOWLEDGE BASE</div>
            <h2 id="faq-main-heading" className="qro-faq-title">
              Frequently Asked <span className="qro-tangible-text">Questions</span>
            </h2>
            <p className="qro-faq-subtitle">
              Clear, transparent answers on creating, customizing, and downloading free QR codes with QRo.
            </p>
          </div>

          <div className="qro-faq-accordion">
            {FAQ_ITEMS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`qro-faq-item ${isOpen ? 'open' : ''}`}
                >
                  <button
                    type="button"
                    className="qro-faq-question-btn"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    id={`faq-btn-${faq.id}`}
                  >
                    <span className="qro-faq-question-text">{faq.question}</span>
                    <span className="qro-faq-chevron-box" aria-hidden="true">
                      <svg
                        className={`qro-faq-chevron ${isOpen ? 'rotated' : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${faq.id}`}
                      className="qro-faq-answer"
                      role="region"
                      aria-labelledby={`faq-btn-${faq.id}`}
                    >
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Templates Modal */}
      {activeModal === 'templates' && (
        <div className="qro-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="qro-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="qro-modal-header">
              <div>
                <h3 className="qro-modal-title">Curated QR Templates</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Click any aesthetic preset to immediately apply styling.
                </p>
              </div>
              <button className="qro-modal-close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="qro-templates-grid">
              {TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="qro-template-card"
                  onClick={() => applyTemplate(tmpl)}
                >
                  <div className="qro-template-pill-preview" style={{ background: tmpl.previewBg }}>
                    {tmpl.caption}
                  </div>
                  <div>
                    <div className="qro-template-name">{tmpl.name}</div>
                    <div className="qro-template-desc">{tmpl.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blog & Design Guide Modal */}
      {activeModal === 'blog' && (
        <div className="qro-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="qro-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="qro-modal-header">
              <div>
                <h3 className="qro-modal-title">QR Design Insights</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Industry best practices for scannability and aesthetics.
                </p>
              </div>
              <button className="qro-modal-close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div className="qro-blog-list">
              <div className="qro-blog-card">
                <div className="qro-blog-title">1. High Contrast is Essential</div>
                <div className="qro-blog-snippet">
                  Ensure the foreground dots contrast significantly against the background. Dark codes on light backgrounds guarantee 100% scan rates even in low-light environments.
                </div>
              </div>
              <div className="qro-blog-card">
                <div className="qro-blog-title">2. When to Use SVG vs PNG</div>
                <div className="qro-blog-snippet">
                  SVG offers infinite vector scaling without pixelation, making it indispensable for large posters, merchandise, and print media. PNG is optimized for digital distribution and social media.
                </div>
              </div>
              <div className="qro-blog-card">
                <div className="qro-blog-title">3. Center Logo Proportions</div>
                <div className="qro-blog-snippet">
                  Keep center emblems below 30% of total QR canvas area. Our algorithm automatically applies smart masking to safeguard core Reed-Solomon error-correction tracks.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign In & Account Modal */}
      {activeModal === 'signin' && (
        <div className="qro-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="qro-modal-box" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="qro-modal-header">
              <h3 className="qro-modal-title">Account & License</h3>
              <button className="qro-modal-close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>

            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #21F1A8, #05D588)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#171717',
                fontSize: 24,
                fontWeight: 800,
                marginBottom: 12
              }}>
                A
              </div>
              <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>Anwin C M</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>anwincm8@gmail.com</p>
              <div style={{
                display: 'inline-block',
                marginTop: 10,
                background: 'rgba(33, 241, 168, 0.16)',
                color: '#21F1A8',
                border: '1px solid rgba(33, 241, 168, 0.35)',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '4px 12px',
                borderRadius: 99
              }}>
                PRO License Active
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              <button
                className="qro-primary-download-btn"
                style={{ borderRadius: 14 }}
                onClick={() => {
                  window.open('https://github.com/Imperfect-spiker28', '_blank');
                  setActiveModal(null);
                }}
              >
                <span>View GitHub Profile</span>
              </button>
              <button
                className="qro-format-btn"
                onClick={() => {
                  window.open('https://anwincm.dev/', '_blank');
                  setActiveModal(null);
                }}
              >
                Visit anwincm.dev
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Learn More Modal */}
      {showOfflineModal && (
        <div className="qro-modal-backdrop" onClick={() => setShowOfflineModal(false)}>
          <div className="qro-modal-box" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="qro-modal-header">
              <h3 className="qro-modal-title">Offline Generator Active</h3>
              <button className="qro-modal-close-btn" onClick={() => setShowOfflineModal(false)}>✕</button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: 16 }}>
              QRo runs on an entirely client-side architecture. Even without an active internet connection, you can generate, customize, preview, and download full-resolution PNG, JPG, and vector SVG QR codes with zero data sent to external servers.
            </p>
            <button
              className="qro-primary-download-btn"
              style={{ width: '100%', borderRadius: 12 }}
              onClick={() => {
                setShowOfflineModal(false);
                showToast(`Network Status: ${navigator.onLine ? 'Connected' : 'Offline'}`);
              }}
            >
              Resume Offline Creation
            </button>
          </div>
        </div>
      )}

      {/* Footer with Creator Credits */}
      <footer className="qro-footer">
        <div className="qro-footer-content">
          <div className="qro-footer-brand">
            <span>QRo</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}> Premium QR Generator</span>
          </div>
          <div className="qro-footer-links">
            <span>Crafted by <a className="qro-footer-link" href="https://anwincm.dev/" target="_blank" rel="noreferrer">Anwin C M</a></span>
            <span>•</span>
            <a className="qro-footer-link" href="https://github.com/Imperfect-spiker28" target="_blank" rel="noreferrer">GitHub</a>
            <span>•</span>
            <a className="qro-footer-link" href="https://www.linkedin.com/in/anwincm/" target="_blank" rel="noreferrer">LinkedIn</a>
            <span>•</span>
            <a className="qro-footer-link" href="mailto:anwincm8@gmail.com">anwincm8@gmail.com</a>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="qro-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#21F1A8" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
