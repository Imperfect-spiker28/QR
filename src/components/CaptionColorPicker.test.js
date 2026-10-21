import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ColorPickerPopover from './ColorPickerPopover';

describe('Caption Color Picker Integration', () => {
  test('renders compact circular color button with current color', () => {
    render(
      <ColorPickerPopover
        color="#21F1A8"
        onChange={() => {}}
        compact={true}
        label="Caption Color"
      />
    );
    const trigger = screen.getByRole('button', { name: /Change Caption Color/i });
    expect(trigger).toHaveClass('qro-compact-color-trigger');
    expect(trigger).toHaveStyle('background: #21F1A8');
  });

  test('opens popover, allows typing HEX color, and triggers onChange', () => {
    const onChange = jest.fn();
    render(
      <ColorPickerPopover
        color="#21F1A8"
        onChange={onChange}
        compact={true}
        label="Caption Color"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Change Caption Color/i }));

    const hexInput = screen.getByPlaceholderText('#21F1A8');
    expect(hexInput).toBeInTheDocument();

    fireEvent.change(hexInput, { target: { value: '#EC4899' } });
    expect(onChange).toHaveBeenCalledWith('#EC4899');
  });

  test('renders reset button when onReset is provided and calls onReset on click', () => {
    const onReset = jest.fn();
    render(
      <ColorPickerPopover
        color="#EC4899"
        onChange={() => {}}
        compact={true}
        onReset={onReset}
        defaultColor="#21F1A8"
        label="Caption Color"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Change Caption Color/i }));

    const resetBtn = screen.getByRole('button', { name: /Reset color/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
