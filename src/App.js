import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';
import anwinLogo from './assets/logo.png';
import ColorPickerPopover from './components/ColorPickerPopover';
import FontSelector from './components/FontSelector';
import { ensureFontLoaded, loadGoogleFont } from './utils/fontCatalog';
import TrustSection from './components/TrustSection';
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

// Default Anwin Logo Asset (Official project logo)
export const DEFAULT_ANWIN_LOGO =
  typeof anwinLogo === 'string' && anwinLogo !== 'test-file-stub'
    ? anwinLogo
    : '/logo.png';

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
      'Yes. You can upload custom PNG, JPG, or SVG logos or select the default monogram. QRo applies smart proportion limits (under 30%) and boosts Reed-Solomon error correction to Level H/Q to maximize scan reliability and error tolerance.',
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
      'QRo generates static QR codes where your content is encoded directly into the matrix without a QRo-hosted redirect server. They do not expire due to a QRo subscription or account status. However, keep in mind that the external destination itself can change or become unavailable, and static codes cannot be edited after printing.',
  },
  {
    id: 'scan-analytics',
    question: 'Do static QR codes provide scan analytics?',
    answer:
      'No. Static QR codes encode raw data directly and do not inherently provide scan analytics or tracking. To measure traffic from a static link QR code, we recommend adding standard UTM parameters (e.g. ?utm_source=qr) directly to your destination URL before generating.',
  },
];

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
  // Theme State: Persist user preference, respect OS preference if no saved preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('qro_theme_v2');
    if (saved === null) {
      localStorage.removeItem('qro_theme');
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return false;
      }
      return true; // Default to Obsidian Dark Theme
    }
    return saved === 'dark';
  });

  // Network Online/Offline State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  // Active Modals: 'templates' | 'blog' | null
  const [activeModal, setActiveModal] = useState(null);

  // Navigation State
  const [activeNav, setActiveNav] = useState('generator');

  // Input Tabs & Data
  const [activeTab, setActiveTab] = useState('link'); // 'link' | 'text' | 'wifi' | 'contact'
  const [urlInput, setUrlInput] = useState('https://qro.anwincm.dev');
  const [textInput, setTextInput] = useState('');
  const [wifiData, setWifiData] = useState({ ssid: '', password: '', encryption: 'WPA' });
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    phone: '',
    email: '',
    organization: '',
    website: '',
  });

  // QR Design States
  const [styleType, setStyleType] = useState('rounded'); // 'classic' | 'rounded' | 'dot_matrix'
  const [fgColor, setFgColor] = useState(() => (isDarkMode ? '#21F1A8' : '#059669'));
  const [gradientEndColor, setGradientEndColor] = useState(() => (isDarkMode ? '#05D588' : '#10B981'));
  const [useGradient, setUseGradient] = useState(true);
  const [bgColor, setBgColor] = useState(() => (isDarkMode ? '#171717' : '#FFFFFF'));

  // Logo States
  const [logoUrl, setLogoUrl] = useState(DEFAULT_ANWIN_LOGO);
  const [hasLogo, setHasLogo] = useState(true);
  const [logoSource, setLogoSource] = useState('default'); // 'none' | 'default' | 'custom'
  const [pendingLogo, setPendingLogo] = useState(null);
  const [logoConfirmType, setLogoConfirmType] = useState(null); // null | 'default' | 'custom'

  // Frame & Caption States
  const [frameEnabled, setFrameEnabled] = useState(true);
  const [captionText, setCaptionText] = useState('SCAN TO OPEN');
  const [captionFont, setCaptionFont] = useState('Plus Jakarta Sans');
  const defaultCaptionColor = isDarkMode ? '#21F1A8' : '#059669';
  const [captionColor, setCaptionColor] = useState(() => (isDarkMode ? '#21F1A8' : '#059669'));
  const handleResetCaptionColor = () => setCaptionColor(isDarkMode ? '#21F1A8' : '#059669');

  // Ensure current caption font is loaded for canvas/preview
  useEffect(() => {
    if (captionFont) {
      loadGoogleFont(captionFont);
    }
  }, [captionFont]);

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

  // Modal close handler that cleans up URL hash
  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
    if (window.location.hash === '#templates' || window.location.hash === '#blog') {
      window.history.replaceState(null, '', window.location.pathname);
      document.title = 'QRo | Free Custom QR Code Generator Online';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Create free custom QR codes for links, text, Wi-Fi, and contacts. Customize colors, styles, logos, and captions, then download your QR codes in PNG, SVG, or JPG.'
        );
      }
    }
  }, []);

  // Synchronize URL Hash, Dynamic Route Metadata & Analytics
  useEffect(() => {
    initAnalytics();

    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      let title = 'QRo | Free Custom QR Code Generator Online';
      let description =
        'Create free custom QR codes for links, text, Wi-Fi, and contacts. Customize colors, styles, logos, and captions, then download your QR codes in PNG, SVG, or JPG.';

      if (hash === '#templates') {
        setActiveNav('templates');
        setActiveModal('templates');
        title = 'Curated QR Code Templates & Presets | QRo';
        description =
          'Explore curated aesthetic QR code templates and color presets. Apply rounded styles, dual-tone gradients, and framed captions instantly.';
        trackPageView('/#templates', title);
      } else if (hash === '#blog') {
        setActiveNav('blog');
        setActiveModal('blog');
        title = 'QR Code Design Insights & Scannability Guides | QRo';
        description =
          'Read industry best practices for QR code contrast, Reed-Solomon error correction, center logo safety, and vector SVG vs PNG exports.';
        trackPageView('/#blog', title);
      } else if (hash === '#faq') {
        setActiveNav('faq');
        setActiveModal(null);
        title = 'Frequently Asked Questions - Free Custom QR Generator | QRo';
        description =
          'Frequently asked questions about creating free, customizable QR codes without signup. Learn about static codes, Wi-Fi formats, and offline generation.';
        trackPageView('/#faq', title);
        document.getElementById('qro-faq')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setActiveNav('generator');
        setActiveModal(null);
        trackPageView('/', title);
      }

      document.title = title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', description);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Synchronize Theme Changes
  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('qro_theme_v2', next ? 'dark' : 'light');

    if (!next) {
      // Switched to Light Theme
      if (captionColor === '#21F1A8') {
        setCaptionColor('#059669');
      }
      if (fgColor === '#21F1A8' && bgColor === '#171717') {
        setFgColor('#059669');
        setGradientEndColor('#10B981');
        setBgColor('#FFFFFF');
      }
    } else {
      // Switched to Dark Theme
      if (captionColor === '#059669') {
        setCaptionColor('#21F1A8');
      }
      if (fgColor === '#059669' && bgColor === '#FFFFFF') {
        setFgColor('#21F1A8');
        setGradientEndColor('#05D588');
        setBgColor('#171717');
      }
    }

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
        return textInput.length > 0 ? textInput : 'Hello from QRo';
      case 'wifi': {
        const escapeWifi = (str) => (str || '').replace(/([\\;,:"])/g, '\\$1');
        const enc = wifiData.encryption || 'WPA';
        const cleanSsid = escapeWifi(wifiData.ssid);
        if (enc === 'nopass') {
          return `WIFI:T:nopass;S:${cleanSsid};;`;
        }
        const cleanPass = escapeWifi(wifiData.password);
        return `WIFI:T:${enc};S:${cleanSsid};P:${cleanPass};;`;
      }
      case 'contact': {
        const escapeVCard = (str) => (str || '').replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n');
        const vcardParts = ['BEGIN:VCARD', 'VERSION:3.0'];
        if (contactData.name) {
          const cleanName = escapeVCard(contactData.name);
          vcardParts.push(`FN:${cleanName}`);
          vcardParts.push(`N:${cleanName};;;;`);
        }
        if (contactData.phone) {
          vcardParts.push(`TEL;TYPE=CELL:${contactData.phone.trim()}`);
        }
        if (contactData.email) {
          vcardParts.push(`EMAIL:${contactData.email.trim()}`);
        }
        if (contactData.organization) {
          vcardParts.push(`ORG:${escapeVCard(contactData.organization)}`);
        }
        if (contactData.website) {
          const rawUrl = contactData.website.trim();
          const cleanUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
          vcardParts.push(`URL:${cleanUrl}`);
        }
        vcardParts.push('END:VCARD');
        return vcardParts.join('\n');
      }
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
        image: DEFAULT_ANWIN_LOGO,
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
          imageSize: 0.28,
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
    } else {
      dotsOptions.gradient = undefined;
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
        imageSize: 0.28,
        hideBackgroundDots: true,
      },
      cornersSquareOptions: {
        type: configs.cornersSquareType,
        color: fgColor,
      },
      cornersDotOptions: {
        type: configs.cornersDotType,
        color: fgColor,
      },
      qrOptions: {
        errorCorrectionLevel: hasLogo ? 'H' : 'Q',
      },
    };

    if (qrCodeInstance.current) {
      if (!useGradient && qrCodeInstance.current._options?.dotsOptions?.gradient) {
        delete qrCodeInstance.current._options.dotsOptions.gradient;
      }
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

  // Handle Logo Upload with validation, SVG sanitization, and replacement confirmation
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('File size exceeds 2MB limit. Please choose a smaller image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate actual file type
    const validMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    if (!validMimes.includes(file.type) && !isSvg) {
      showToast('Unsupported file format. Please upload a PNG, JPG, or SVG.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const applyOrConfirmLogo = (validatedUrl) => {
      // Prompt confirmation ONLY if a custom logo is already uploaded and active
      if (hasLogo && logoSource === 'custom') {
        setPendingLogo(validatedUrl);
        setLogoConfirmType('custom');
      } else {
        // No custom logo (no logo or default logo displayed): apply immediately with zero warning
        setLogoUrl(validatedUrl);
        setHasLogo(true);
        setLogoSource('custom');
        if (fileInputRef.current) fileInputRef.current.value = '';
        showToast('Logo applied successfully!');
      }
    };

    if (isSvg) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawSvg = event.target.result;
        if (!rawSvg) return;
        // Sanitize SVG against XSS & script execution
        const sanitizedSvg = rawSvg
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
          .replace(/javascript\s*:/gi, '');
        const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sanitizedSvg)}`;
        applyOrConfirmLogo(dataUrl);
      };
      reader.onerror = () => {
        showToast('Error reading SVG file.');
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target.result;
        if (!rawDataUrl) return;
        // Verify raster image decodes cleanly in browser
        if (typeof Image !== 'undefined' && process.env.NODE_ENV !== 'test') {
          const img = new Image();
          img.onload = () => {
            applyOrConfirmLogo(rawDataUrl);
          };
          img.onerror = () => {
            showToast('Invalid or corrupt image file. Please upload a valid PNG or JPG.');
            if (fileInputRef.current) fileInputRef.current.value = '';
          };
          img.src = rawDataUrl;
        } else {
          applyOrConfirmLogo(rawDataUrl);
        }
      };
      reader.onerror = () => {
        showToast('Error reading image file.');
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelLogoReplace = () => {
    setPendingLogo(null);
    setLogoConfirmType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmLogoReplace = () => {
    if (pendingLogo) {
      setLogoUrl(pendingLogo);
      setHasLogo(true);
      setLogoSource('custom');
      showToast('Logo replaced successfully!');
    }
    setPendingLogo(null);
    setLogoConfirmType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveCustomLogo = () => {
    setLogoUrl(DEFAULT_ANWIN_LOGO);
    setHasLogo(true);
    setLogoSource('default');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Custom logo removed. Restored default logo.');
  };

  const handleRestoreDefaultLogo = () => {
    setLogoUrl(DEFAULT_ANWIN_LOGO);
    setHasLogo(true);
    setLogoSource('default');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Default Anwin logo restored.');
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
          imageSize: 0.28,
          hideBackgroundDots: true,
        },
        cornersSquareOptions: {
          type: configs.cornersSquareType,
          color: fgColor,
        },
        cornersDotOptions: {
          type: configs.cornersDotType,
          color: fgColor,
        },
        qrOptions: {
          errorCorrectionLevel: hasLogo ? 'H' : 'Q',
        },
      };

      const exportQr = new QRCodeStyling(exportOptions);

      if (format === 'svg') {
        if (frameEnabled && captionText) {
          try {
            const rawSvgBlob = await exportQr.getRawData('svg');
            if (rawSvgBlob) {
              const svgString = await rawSvgBlob.text();
              const scale = (typeof resolution === 'number' ? resolution : 1024) / 290;
              const padding = Math.round(36 * scale);
              const bottomPadding = Math.round(54 * scale);
              const qrSize = typeof resolution === 'number' ? resolution : 1024;
              const cardWidth = Math.round(qrSize + padding * 2);
              const cardHeight = Math.round(qrSize + padding + bottomPadding);
              const fontParam = encodeURIComponent(captionFont).replace(/%20/g, '+');
              const fontUrl = `https://fonts.googleapis.com/css2?family=${fontParam}:wght@700&amp;display=swap`;

              const innerMatch = svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
              const innerSvg = innerMatch ? innerMatch[1] : svgString;

              const framedSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}">
  <defs>
    <style>
      @import url('${fontUrl}');
      .qro-caption-text {
        font-family: '${captionFont}', sans-serif;
        font-weight: 700;
        font-size: ${Math.round(14 * scale)}px;
        letter-spacing: ${Math.round(3 * scale)}px;
        fill: ${captionColor};
        text-anchor: middle;
        text-transform: uppercase;
      }
    </style>
  </defs>
  <rect width="${cardWidth}" height="${cardHeight}" rx="${Math.round(20 * scale)}" ry="${Math.round(20 * scale)}" fill="${bgColor === '#FFFFFF' ? '#FFFFFF' : bgColor}" />
  <g transform="translate(${padding}, ${padding})">
    ${innerSvg}
  </g>
  <text x="${cardWidth / 2}" y="${qrSize + padding + Math.round(34 * scale)}" class="qro-caption-text">${captionText.toUpperCase()}</text>
</svg>`;

              const blob = new Blob([framedSvg], { type: 'image/svg+xml;charset=utf-8' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `qro-${Date.now()}.svg`;
              link.click();
              URL.revokeObjectURL(link.href);
              showToast('Downloaded framed vector QR code as SVG!');
              setIsDownloading(false);
              return;
            }
          } catch (svgErr) {
            console.warn('Framed SVG fallback to direct download', svgErr);
          }
        }

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
        // Ensure caption font is loaded before painting
        await ensureFontLoaded(captionFont);

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
          ctx.fillStyle = captionColor;
          ctx.font = `bold ${Math.round(14 * scale)}px "${captionFont}", sans-serif`;
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
          </div>

          <nav>
            <ul className="qro-nav-links">
              <li
                className={`qro-nav-item ${activeNav === 'generator' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('generator');
                  handleCloseModal();
                  window.location.hash = '#generator';
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
                  window.location.hash = '#templates';
                }}
              >
                Templates
              </li>
              <li
                className={`qro-nav-item ${activeNav === 'faq' ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav('faq');
                  handleCloseModal();
                  window.location.hash = '#faq';
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
                  window.location.hash = '#blog';
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

            {/* Dark & Light Theme Toggle Switch */}
            <button
              type="button"
              className={`qro-theme-toggle-switch ${isDarkMode ? 'dark' : 'light'}`}
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Theme`}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <span className="qro-toggle-thumb">
                <svg
                  className="qro-toggle-icon qro-toggle-icon-sun"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4" fill="#ffffff" stroke="none" />
                  <line x1="12" y1="2" x2="12" y2="4.5" />
                  <line x1="12" y1="19.5" x2="12" y2="22" />
                  <line x1="4.93" y1="4.93" x2="6.7" y2="6.7" />
                  <line x1="17.3" y1="17.3" x2="19.07" y2="19.07" />
                  <line x1="2" y1="12" x2="4.5" y2="12" />
                  <line x1="19.5" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="19.07" x2="6.7" y2="17.3" />
                  <line x1="17.3" y1="6.7" x2="19.07" y2="4.93" />
                </svg>
                <svg
                  className="qro-toggle-icon qro-toggle-icon-moon"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="#ffffff"
                  aria-hidden="true"
                >
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </span>
            </button>
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="qro-main-content" id="generator-workspace">
        {/* Hero Section */}
        <div className="qro-hero-heading">
          {isDarkMode && <div className="qro-eyebrow">LINK TO QR CODE GENERATOR</div>}
          <h1 className="qro-headline">
            {isDarkMode ? (
              <>
                Make links <span className="qro-tangible-text">tangible.</span>
              </>
            ) : (
              <>
                Create QR Codes <br />
                for a <span className="qro-smarter-text">smarter sharing.</span>
              </>
            )}
          </h1>
          {isDarkMode && <h2 className="qro-subheadline">Create a QR code worth sharing.</h2>}
          <p className="qro-desc">
            {isDarkMode
              ? 'Turn any link, text or information into a beautiful, scannable QR code. Clean. Custom. Yours.'
              : 'Turn any link, text, Wi-Fi or contact into a beautiful, scannable QR code. Clean. Custom. Yours.'}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="qro-input-wrapper">
                    <input
                      type="text"
                      className="qro-text-input"
                      placeholder="Wi-Fi Network Name (SSID)"
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                      aria-label="Wi-Fi Network Name (SSID)"
                    />
                  </div>

                  {/* Encryption Selection */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label htmlFor="wifi-enc-select" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Security:
                    </label>
                    <select
                      id="wifi-enc-select"
                      value={wifiData.encryption}
                      onChange={(e) => setWifiData({ ...wifiData, encryption: e.target.value })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        color: 'var(--input-text)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                      aria-label="Wi-Fi Security Type"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Recommended)</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None / Open Network</option>
                    </select>
                  </div>

                  {wifiData.encryption !== 'nopass' && (
                    <div className="qro-input-wrapper">
                      <input
                        type={showWifiPassword ? 'text' : 'password'}
                        className="qro-text-input"
                        placeholder="Wi-Fi Password"
                        value={wifiData.password}
                        onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                        aria-label="Wi-Fi Password"
                      />
                      <button
                        type="button"
                        className="qro-clear-btn"
                        onClick={() => setShowWifiPassword(!showWifiPassword)}
                        title={showWifiPassword ? 'Hide password' : 'Show password'}
                        aria-label={showWifiPassword ? 'Hide password' : 'Show password'}
                      >
                        {showWifiPassword ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--input-border)',
                    lineHeight: 1.4
                  }}>
                    ⚠️ <strong>Notice:</strong> Anyone who scans this QR code will see your Wi-Fi credentials in plain text.
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="qro-input-wrapper">
                    <input
                      type="text"
                      className="qro-text-input"
                      placeholder="Full Name (e.g., Alex Morgan)"
                      value={contactData.name}
                      onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      aria-label="Full Name"
                    />
                  </div>
                  <div className="qro-input-wrapper">
                    <input
                      type="tel"
                      className="qro-text-input"
                      placeholder="Phone Number"
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      aria-label="Phone Number"
                    />
                  </div>
                  <div className="qro-input-wrapper">
                    <input
                      type="email"
                      className="qro-text-input"
                      placeholder="Email Address"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      aria-label="Email Address"
                    />
                  </div>
                  <div className="qro-input-wrapper">
                    <input
                      type="text"
                      className="qro-text-input"
                      placeholder="Organization / Company"
                      value={contactData.organization}
                      onChange={(e) => setContactData({ ...contactData, organization: e.target.value })}
                      aria-label="Organization or Company"
                    />
                  </div>
                  <div className="qro-input-wrapper">
                    <input
                      type="url"
                      className="qro-text-input"
                      placeholder="Website URL (e.g., https://example.com)"
                      value={contactData.website}
                      onChange={(e) => setContactData({ ...contactData, website: e.target.value })}
                      aria-label="Website URL"
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
                    <span>High Contrast ({getContrastRatio(fgColor, bgColor).toFixed(1)}:1) — Recommended for scanning reliability</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>Low Contrast ({getContrastRatio(fgColor, bgColor).toFixed(1)}:1) — May reduce scanning reliability under certain cameras</span>
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
                  role="button"
                  tabIndex={0}
                  aria-label="Upload custom logo file"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                        fileInputRef.current.click();
                      }
                    }
                  }}
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                      fileInputRef.current.click();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
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
                  <div className="qro-logo-active-group">
                    <div
                      className="qro-logo-preview-badge"
                      title={logoSource === 'default' ? 'Default Anwin Logo' : 'Custom Uploaded Logo'}
                    >
                      <img
                        src={logoUrl}
                        alt={logoSource === 'default' ? 'Default Anwin Logo' : 'Custom Uploaded Logo'}
                      />
                    </div>

                    <div className="qro-logo-actions-col">
                      {logoSource === 'custom' ? (
                        <>
                          <button
                            type="button"
                            className="qro-btn-remove-logo"
                            onClick={handleRemoveCustomLogo}
                            aria-label="Remove custom logo and restore default Anwin logo"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Remove Logo</span>
                          </button>
                          <button
                            type="button"
                            className="qro-btn-restore-default"
                            onClick={handleRestoreDefaultLogo}
                            aria-label="Restore default Anwin logo"
                          >
                            Restore Default
                          </button>
                        </>
                      ) : (
                        <div className="qro-default-logo-tag">
                          <span className="qro-default-logo-indicator" />
                          <span>Default Logo</span>
                        </div>
                      )}
                    </div>
                  </div>
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

                <label className="qro-switch" aria-label="Toggle frame & caption">
                  <input
                    type="checkbox"
                    aria-label="Toggle frame & caption"
                    checked={frameEnabled}
                    onChange={(e) => setFrameEnabled(e.target.checked)}
                  />
                  <span className="qro-switch-slider" />
                </label>
              </div>

              {frameEnabled && (
                <div className="qro-caption-controls-stack">
                  <div className="qro-caption-input-box">
                    <input
                      type="text"
                      className="qro-caption-field"
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      placeholder="SCAN TO OPEN"
                      aria-label="Frame caption text"
                    />
                    <div className="qro-caption-color-action-wrap" title="Caption Color Picker">
                      <ColorPickerPopover
                        color={captionColor}
                        onChange={setCaptionColor}
                        compact={true}
                        onReset={handleResetCaptionColor}
                        defaultColor={defaultCaptionColor}
                        label="Caption Color"
                      />
                    </div>
                  </div>

                  {/* 100+ Font Searchable Typography Selector */}
                  <FontSelector
                    selectedFont={captionFont}
                    onSelectFont={(newFont) => {
                      setCaptionFont(newFont);
                      showToast(`Typography set to: ${newFont}`);
                    }}
                    captionText={captionText}
                  />
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
                    style={{ fontFamily: `"${captionFont}", sans-serif`, color: captionColor }}
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

      {/* Direct-Encoding Trust Section */}
      <TrustSection />

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
        <div className="qro-modal-backdrop" onClick={handleCloseModal}>
          <div className="qro-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="qro-modal-header">
              <div>
                <h3 className="qro-modal-title">Curated QR Templates</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Click any aesthetic preset to immediately apply styling.
                </p>
              </div>
              <button className="qro-modal-close-btn" onClick={handleCloseModal}>✕</button>
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
        <div className="qro-modal-backdrop" onClick={handleCloseModal}>
          <div className="qro-modal-box" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className="qro-modal-header">
              <div>
                <h3 className="qro-modal-title">QR Code Engineering & Design Guides</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Technical deep-dives on matrix contrast, error correction, vector print fidelity, and privacy.
                </p>
              </div>
              <button className="qro-modal-close-btn" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="qro-blog-list">
              <article className="qro-blog-card">
                <div className="qro-blog-title">1. Luminance Contrast & Scannability: The 4:1 Ratio Rule</div>
                <div className="qro-blog-snippet">
                  Optical camera sensors calculate luminance delta between dark and light modules. A minimum contrast ratio of 4:1 ensures flawless decoding across dirty lenses, glare, low ambient light, and moving angles. Dark foregrounds over light backgrounds consistently yield the highest scanning speeds.
                </div>
              </article>
              <article className="qro-blog-card">
                <div className="qro-blog-title">2. Vector SVG vs High-Res PNG: When to Use Each Export</div>
                <div className="qro-blog-snippet">
                  Vector SVG files use mathematical curves rather than fixed pixels, making them indispensable for billboards, merchandise, vehicle wraps, and commercial offset printing without pixelation. Raster PNGs (up to 2048px) are optimal for digital displays, email signatures, apps, and web use.
                </div>
              </article>
              <article className="qro-blog-card">
                <div className="qro-blog-title">3. Center Logo Proportions & Reed-Solomon Error Correction</div>
                <div className="qro-blog-snippet">
                  Embedding a brand emblem covers part of the functional matrix. QRo elevates Reed-Solomon Error Correction to Level H (30% physical recovery tolerance) and constrains center emblems below 28-30% of total area with safe padding, preserving scanning reliability across all standard smartphone camera apps.
                </div>
              </article>
              <article className="qro-blog-card">
                <div className="qro-blog-title">4. Static vs Dynamic QR Codes: Architecture, Privacy & Longevity</div>
                <div className="qro-blog-snippet">
                  Dynamic codes route scans through a proprietary redirect server, exposing destinations to subscription paywalls, domain outages, and analytics tracking. Static QR codes write the destination directly into the physical matrix, operating permanently with zero third-party dependencies and complete privacy.
                </div>
              </article>
              <article className="qro-blog-card">
                <div className="qro-blog-title">5. Wi-Fi QR Codes: WPA, WEP & Mobile Network Security</div>
                <div className="qro-blog-snippet">
                  Modern iOS and Android operating systems natively parse standard WIFI: schemas to join protected wireless networks with a single camera tap. Generating codes 100% client-side in the browser prevents home or office Wi-Fi passwords from ever transmitting across the public internet.
                </div>
              </article>
            </div>
          </div>
        </div>
      )}

      {/* Logo Replacement Confirmation Dialog */}
      {logoConfirmType && (
        <div className="qro-modal-backdrop" onClick={handleCancelLogoReplace}>
          <div
            className="qro-modal-box"
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logo-replace-dialog-title"
          >
            <div className="qro-modal-header">
              <h3 id="logo-replace-dialog-title" className="qro-modal-title">
                Replace the current logo?
              </h3>
              <button
                className="qro-modal-close-btn"
                onClick={handleCancelLogoReplace}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Your current custom logo will be replaced with the newly selected logo.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="qro-dialog-cancel-btn"
                onClick={handleCancelLogoReplace}
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  border: '1px solid var(--input-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="qro-primary-download-btn"
                onClick={handleConfirmLogoReplace}
                style={{
                  padding: '10px 20px',
                  borderRadius: 12,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  width: 'auto',
                  boxShadow: '0 4px 14px rgba(33, 241, 168, 0.3)',
                }}
              >
                Replace Logo
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
