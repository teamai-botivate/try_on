"use client";

interface SliderControlProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

export default function SliderControl({
  value,
  onChange,
  min,
  max,
  step,
}: SliderControlProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 sm:h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
        style={{
          background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
        }}
        aria-label="Adjustment slider"
      />
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          touch-action: pan-x;
        }

        input[type="range"]::-webkit-slider-thumb:active {
          box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.2);
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-moz-range-thumb:active {
          box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.2);
        }

        /* Track styling */
        input[type="range"]::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
          background: inherit;
        }

        input[type="range"]::-moz-range-track {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}
