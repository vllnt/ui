"use client";

export default function BarChartPreview() {
  return (
    <div className="flex items-end justify-center gap-2 h-[80px] w-[160px]">
      <div
        className="w-8 bg-current opacity-60 rounded-t"
        style={{ height: "40%" }}
      />
      <div
        className="w-8 bg-current opacity-60 rounded-t"
        style={{ height: "60%" }}
      />
      <div
        className="w-8 bg-current opacity-60 rounded-t"
        style={{ height: "80%" }}
      />
      <div
        className="w-8 bg-current opacity-60 rounded-t"
        style={{ height: "50%" }}
      />
    </div>
  );
}
