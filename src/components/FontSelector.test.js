import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FontSelector from './FontSelector';
import { FONT_CATALOG } from '../utils/fontCatalog';

describe('FontSelector Component', () => {
  test('renders current font in trigger button with preview', () => {
    render(<FontSelector selectedFont="Plus Jakarta Sans" onSelectFont={() => {}} captionText="TEST" />);
    expect(screen.getByRole('button', { name: /Select caption font/i })).toBeInTheDocument();
    expect(screen.getByText('Plus Jakarta Sans')).toBeInTheDocument();
    expect(screen.getByText('Aa')).toBeInTheDocument();
  });

  test('opens dropdown on click, shows search, category tabs and font options', () => {
    render(<FontSelector selectedFont="Outfit" onSelectFont={() => {}} captionText="TEST" />);
    const trigger = screen.getByRole('button', { name: /Select caption font/i });
    fireEvent.click(trigger);

    expect(screen.getByPlaceholderText(/Search fonts/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sans Serif' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Serif' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Display' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Monospace' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Handwritten' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Modern' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decorative' })).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThanOrEqual(100);
  });

  test('filters fonts when typing in search input', () => {
    render(<FontSelector selectedFont="Outfit" onSelectFont={() => {}} captionText="TEST" />);
    fireEvent.click(screen.getByRole('button', { name: /Select caption font/i }));

    const searchInput = screen.getByPlaceholderText(/Search fonts/i);
    fireEvent.change(searchInput, { target: { value: 'roboto' } });

    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Roboto')).toBeInTheDocument();
  });

  test('calls onSelectFont when a font item is clicked', () => {
    const onSelect = jest.fn();
    render(<FontSelector selectedFont="Outfit" onSelectFont={onSelect} captionText="TEST" />);
    fireEvent.click(screen.getByRole('button', { name: /Select caption font/i }));

    const playfairOption = screen.getByText('Playfair Display');
    fireEvent.click(playfairOption);

    expect(onSelect).toHaveBeenCalledWith('Playfair Display');
  });

  test('filters fonts by category tab', () => {
    render(<FontSelector selectedFont="Outfit" onSelectFont={() => {}} captionText="TEST" />);
    fireEvent.click(screen.getByRole('button', { name: /Select caption font/i }));

    const monoTab = screen.getByRole('button', { name: 'Monospace' });
    fireEvent.click(monoTab);

    expect(screen.getByText('JetBrains Mono')).toBeInTheDocument();
    expect(screen.queryByText('Playfair Display')).not.toBeInTheDocument();
  });
});
