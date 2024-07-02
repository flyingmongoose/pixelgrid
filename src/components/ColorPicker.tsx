// src/components/ColorPicker.tsx

import React from 'react';
import { RgbaColorPicker, RgbaColor } from 'react-colorful';

interface ColorPickerProps {
  color: RgbaColor;
  onChange: (color: RgbaColor) => void;
}

export const ColorPicker = React.memo(({ color, onChange }: ColorPickerProps) => {
  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof RgbaColor) => {
    let value = parseFloat(e.target.value);
    if (key === 'a') {
      value = Math.min(1, Math.max(0, value));
    } else {
      value = Math.min(255, Math.max(0, Math.round(value)));
    }
    onChange({ ...color, [key]: value });
  };

  const colorLabels = {
    r: 'Red',
    g: 'Green',
    b: 'Blue',
    a: 'Alpha'
  };

  return (
    <div>
      <div style={{ width: '100%' }}>
        <RgbaColorPicker color={color} onChange={onChange} style={{ width: '100%' }} />
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2">
        {(['r', 'g', 'b', 'a'] as const).map((key) => (
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
