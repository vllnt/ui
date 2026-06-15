"use client";

export default function LineChartPreview() {
  return (
    <div className="flex items-center justify-center h-[80px] w-[160px]">
      <svg className="w-full h-full" viewBox="0 0 160 80">
        <path
          d="M0,50 L40,30 L80,45 L120,15 L160,25"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="0" cy="50" fill="currentColor" r="3" />
        <circle cx="40" cy="30" fill="currentColor" r="3" />
        <circle cx="80" cy="45" fill="currentColor" r="3" />
        <circle cx="120" cy="15" fill="currentColor" r="3" />
        <circle cx="160" cy="25" fill="currentColor" r="3" />
      </svg>
    </div>
  );
}
