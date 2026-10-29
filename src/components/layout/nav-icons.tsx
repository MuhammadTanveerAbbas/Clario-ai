export function Icon3D_Dashboard({ p = "sb" }: { p?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="3" fill={`url(#${p}-db-g1)`}/>
      <rect x="18" y="2" width="12" height="12" rx="3" fill={`url(#${p}-db-g2)`}/>
      <rect x="2" y="18" width="12" height="12" rx="3" fill={`url(#${p}-db-g3)`}/>
      <rect x="18" y="18" width="12" height="12" rx="3" fill={`url(#${p}-db-g4)`}/>
      <rect x="3" y="3" width="10" height="3" rx="1.5" fill="rgba(255,255,255,0.35)"/>
      <rect x="19" y="3" width="10" height="3" rx="1.5" fill="rgba(255,255,255,0.35)"/>
      <defs>
        <linearGradient id={`${p}-db-g1`} x1="2" y1="2" x2="14" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c"/><stop offset="1" stopColor="#c2410c"/>
        </linearGradient>
        <linearGradient id={`${p}-db-g2`} x1="18" y1="2" x2="30" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#0369a1"/>
        </linearGradient>
        <linearGradient id={`${p}-db-g3`} x1="2" y1="18" x2="14" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399"/><stop offset="1" stopColor="#047857"/>
        </linearGradient>
        <linearGradient id={`${p}-db-g4`} x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc"/><stop offset="1" stopColor="#6d28d9"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Icon3D_Summarizer({ p = "sb" }: { p?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id={`${p}-sum-g`} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fb923c"/><stop offset="1" stopColor="#c2410c"/>
        </linearGradient>
      </defs>
      <rect x="4" y="2" width="20" height="26" rx="3" fill={`url(#${p}-sum-g)`}/>
      <path d="M20 2 L28 10 L20 10 Z" fill="rgba(0,0,0,0.25)"/>
      <path d="M20 2 L28 10 L24 6 Z" fill="rgba(255,255,255,0.2)"/>
      <rect x="5" y="3" width="12" height="2.5" rx="1.25" fill="rgba(255,255,255,0.35)"/>
      <rect x="7" y="14" width="12" height="2" rx="1" fill="rgba(255,255,255,0.75)"/>
      <rect x="7" y="18" width="9" height="2" rx="1" fill="rgba(255,255,255,0.55)"/>
      <rect x="7" y="22" width="10" height="2" rx="1" fill="rgba(255,255,255,0.55)"/>
    </svg>
  );
}

export function Icon3D_Remix({ p = "sb" }: { p?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id={`${p}-rx-g`} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc"/><stop offset="1" stopColor="#6d28d9"/>
        </linearGradient>
      </defs>
      <polygon points="16,3 27,9.5 27,22.5 16,29 5,22.5 5,9.5" fill={`url(#${p}-rx-g)`}/>
      <polygon points="16,3 27,9.5 22,9.5 11,3" fill="rgba(255,255,255,0.18)"/>
      <path d="M18 9L12 17H16.5L14 23L20 15H15.5L18 9Z" fill="white" fillOpacity="0.9"/>
    </svg>
  );
}

export function Icon3D_Chat({ p = "sb" }: { p?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id={`${p}-ch-g`} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#0369a1"/>
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="24" height="18" rx="5" fill={`url(#${p}-ch-g)`}/>
      <rect x="4" y="5" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.3)"/>
      <path d="M6 22 L4 29 L14 24" fill={`url(#${p}-ch-g)`}/>
      <circle cx="10" cy="13" r="2.2" fill="white" fillOpacity="0.9"/>
      <circle cx="16" cy="13" r="2.2" fill="white" fillOpacity="0.9"/>
      <circle cx="22" cy="13" r="2.2" fill="white" fillOpacity="0.9"/>
    </svg>
  );
}

export function Icon3D_BrandVoice({ p = "sb" }: { p?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id={`${p}-bv-g`} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399"/><stop offset="1" stopColor="#047857"/>
        </linearGradient>
      </defs>
      <rect x="11" y="3" width="10" height="16" rx="5" fill={`url(#${p}-bv-g)`}/>
      <rect x="12" y="4" width="6" height="3" rx="1.5" fill="rgba(255,255,255,0.35)"/>
      <path d="M7 17 Q7 26 16 26 Q25 26 25 17" stroke={`url(#${p}-bv-g)`} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="16" y1="26" x2="16" y2="30" stroke={`url(#${p}-bv-g)`} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="11" y1="30" x2="21" y2="30" stroke={`url(#${p}-bv-g)`} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function Icon3D_Calendar({ p = "sb" }: { p?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id={`${p}-cal-g`} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f472b6"/><stop offset="1" stopColor="#9d174d"/>
        </linearGradient>
      </defs>
      <rect x="2" y="7" width="28" height="23" rx="4" fill={`url(#${p}-cal-g)`}/>
      <rect x="2" y="7" width="28" height="8" rx="4" fill="rgba(0,0,0,0.2)"/>
      <rect x="2" y="11" width="28" height="4" fill="rgba(0,0,0,0.2)"/>
      <rect x="4" y="8" width="22" height="2.5" rx="1.25" fill="rgba(255,255,255,0.25)"/>
      <rect x="9" y="3" width="3" height="8" rx="1.5" fill="#f9a8d4"/>
      <rect x="20" y="3" width="3" height="8" rx="1.5" fill="#f9a8d4"/>
      <circle cx="9" cy="22" r="2" fill="white" fillOpacity="0.8"/>
      <circle cx="16" cy="22" r="2" fill="white" fillOpacity="0.8"/>
      <circle cx="23" cy="22" r="2" fill="white" fillOpacity="0.8"/>
      <circle cx="9" cy="27" r="2" fill="white" fillOpacity="0.5"/>
      <circle cx="16" cy="27" r="2" fill="white" fillOpacity="0.5"/>
    </svg>
  );
}
