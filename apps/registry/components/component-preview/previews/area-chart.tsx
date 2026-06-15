"use client";

export default function AreaChartPreview() {
  return (
    <div className="flex items-center justify-center h-[80px] w-[160px]">
      <svg className="w-full h-full" viewBox="0 0 160 80">
        <defs>
          <linearGradient gradientTransform="rotate(90)" id="area-grad">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,60 L40,40 L80,50 L120,20 L160,30 L160,80 L0,80 Z"
          fill="url(#area-grad)"
        />
        <path
          d="M0,60 L40,40 L80,50 L120,20 L160,30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
