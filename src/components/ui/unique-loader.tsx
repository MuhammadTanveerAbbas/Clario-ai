"use client";

export function UniqueLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm">
      <div className="relative">
        {/* Outer ring */}
        <div className="h-20 w-20 rounded-full border-2 border-white/10"></div>

        {/* Spinning rings */}
        <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-2 border-transparent border-t-[#4169E1] shadow-[0_0_20px_rgba(65,105,225,0.5)]"></div>
        <div
          className="absolute inset-1 h-18 w-18 animate-spin rounded-full border-2 border-transparent border-t-white/60"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-6 w-6 text-[#4169E1] animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ filter: 'drop-shadow(0 0 8px rgba(65,105,225,0.6))' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        {/* Pulsing background effect */}
        <div className="absolute inset-0 h-20 w-20 rounded-full bg-[#4169E1]/10 animate-ping"></div>
      </div>

      {/* Loading text */}
      <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
      </div>
    </div>
  );
}
