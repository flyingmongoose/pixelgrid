// src/components/ColorPicker.tsx

import React, { useCallback } from 'react';
import { RgbaColorPicker, RgbaColor } from 'react-colorful';

interface ColorPickerProps {
  color: RgbaColor;
  onChange: (color: RgbaColor) => void;
}

type ColorKey = keyof RgbaColor;

const colorLabels: Record<ColorKey, string> = {
  r: 'Red',
  g: 'Green',
  b: 'Blue',
  a: 'Alpha'
};

/**
 * ColorPicker component for selecting and displaying RGBA colors.
 * @param {ColorPickerProps} props - The props for the ColorPicker component.
 * @returns {JSX.Element} The rendered ColorPicker component.
 */
export const ColorPicker: React.FC<ColorPickerProps> = React.memo(({ color, onChange }) => {
  const handleColorInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, key: ColorKey) => {
    let value = parseFloat(e.target.value);
    if (key === 'a') {
      value = Math.min(1, Math.max(0, value));
    } else {
      value = Math.min(255, Math.max(0, Math.round(value)));
    }
    onChange({ ...color, [key]: value });
  }, [color, onChange]);

  return (
    <div>
      <div style={{ width: '100%' }}>
        <RgbaColorPicker color={color} onChange={onChange} style={{ width: '100%' }} />
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2">
        {(Object.keys(colorLabels) as ColorKey[]).map((key) => (
          <div key={key} className="flex flex-col">
            <label htmlFor={`color-${key}`} className="text-sm font-medium text-gray-700 mb-1">
              {colorLabels[key]}
            </label>
            <input
              id={`color-${key}`}
              type="number"
              value={color[key]}
              onChange={(e) => handleColorInputChange(e, key)}
              className="border border-gray-300 p-1 rounded-lg w-full"
              min={key === 'a' ? "0" : "0"}
              max={key === 'a' ? "1" : "255"}
              step={key === 'a' ? "0.01" : "1"}
            />
          </div>
        ))}
      </div>
      <div 
        className="w-full h-8 rounded-lg mt-2 border border-gray-300"
        style={{ backgroundColor: `rgba(${color.r},${color.g},${color.b},${color.a})` }}
      ></div>
    </div>
  );
});

ColorPicker.displayName = 'ColorPicker';
