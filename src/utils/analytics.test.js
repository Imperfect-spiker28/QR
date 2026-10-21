import {
  trackContentTypeSelect,
  trackQrDownload,
  trackFaqToggle,
} from './analytics';
import { FAQ_ITEMS } from '../App';

describe('QRo Analytics & Privacy Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete window.gtag;
  });

  test('FAQ_ITEMS includes all verified questions with non-empty answers', () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(7);
    FAQ_ITEMS.forEach((faq) => {
      expect(faq.id).toBeTruthy();
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
      expect(faq.answer.length).toBeGreaterThan(20);
    });
  });

  test('trackContentTypeSelect logs event without exposing sensitive values', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    trackContentTypeSelect('wifi');
    expect(consoleSpy).toHaveBeenCalled();
    const loggedParams = consoleSpy.mock.calls[0][3];
    expect(loggedParams).toEqual({ content_type: 'wifi' });
    expect(loggedParams.password).toBeUndefined();
    consoleSpy.mockRestore();
  });

  test('trackQrDownload tracks format and resolution safely', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    trackQrDownload({ format: 'svg', resolution: 'svg', framed: true, style: 'rounded' });
    expect(consoleSpy).toHaveBeenCalled();
    const loggedParams = consoleSpy.mock.calls[0][3];
    expect(loggedParams).toEqual({
      format: 'svg',
      resolution: 'svg',
      has_frame: true,
      style: 'rounded',
    });
    consoleSpy.mockRestore();
  });

  test('trackFaqToggle dispatches toggle status', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    trackFaqToggle('free-qr', true);
    expect(consoleSpy).toHaveBeenCalled();
    const loggedParams = consoleSpy.mock.calls[0][3];
    expect(loggedParams).toEqual({
      faq_id: 'free-qr',
      expanded: true,
    });
    consoleSpy.mockRestore();
  });
});
