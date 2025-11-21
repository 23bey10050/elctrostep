'use client'
import React from 'react'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  label?: string
  unit?: string
  className?: string
}

export default function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit = '',
  className = ''
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">{label}</label>
          <span className="text-xs font-semibold text-primary-600">
            {value > 0 && '+'}{value}{unit}
          </span>
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${percentage}%, rgb(229 231 235) ${percentage}%, rgb(229 231 235) 100%)`
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgb(59 130 246);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.15s ease;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        }
        .slider-thumb::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgb(59 130 246);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.15s ease;
        }
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  )
}
