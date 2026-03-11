'use client';

export default function FrustratedIllustration({ className = 'w-full h-64' }) {
    return (
        <svg viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Scattered documents */}
            <rect x="30" y="160" width="50" height="38" rx="4" fill="#FEE2E2" transform="rotate(-15 55 179)" />
            <rect x="90" y="175" width="45" height="34" rx="4" fill="#FEF3C7" transform="rotate(8 112 192)" />
            <rect x="240" y="165" width="48" height="36" rx="4" fill="#E0E7FF" transform="rotate(-10 264 183)" />
            <rect x="280" y="145" width="42" height="32" rx="4" fill="#FEE2E2" transform="rotate(5 301 161)" />
            {/* Person - simple flat style */}
            <circle cx="160" cy="95" r="38" fill="#FDE68A" />
            <ellipse cx="160" cy="195" rx="52" ry="55" fill="#6366F1" opacity="0.9" />
            {/* Frustrated face */}
            <path d="M140 90 Q150 85 160 88" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M160 88 Q170 85 180 90" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M135 105 Q160 98 185 105" stroke="#B45309" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Sweat drop */}
            <ellipse cx="195" cy="78" rx="5" ry="9" fill="#93C5FD" opacity="0.9" />
            {/* Arms - holding head */}
            <path d="M115 120 L130 155 L120 160 L105 125 Z" fill="#FDE68A" stroke="#FCD34D" strokeWidth="1" />
            <path d="M205 120 L190 155 L200 160 L215 125 Z" fill="#FDE68A" stroke="#FCD34D" strokeWidth="1" />
            {/* Confusion marks */}
            <text x="55" y="140" fontSize="22" fill="#EF4444" fontWeight="bold" opacity="0.8">?</text>
            <text x="255" y="125" fontSize="18" fill="#F59E0B" fontWeight="bold" opacity="0.8">?</text>
        </svg>
    );
}
