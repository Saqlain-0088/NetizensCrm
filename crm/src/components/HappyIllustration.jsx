'use client';

export default function HappyIllustration({ className = 'w-full h-64' }) {
    return (
        <svg viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Organized blocks - dashboard style */}
            <rect x="40" y="155" width="70" height="45" rx="6" fill="#E9D5FF" />
            <rect x="120" y="148" width="65" height="42" rx="6" fill="#C4B5FD" />
            <rect x="195" y="155" width="68" height="44" rx="6" fill="#DDD6FE" />
            <rect x="273" y="150" width="62" height="40" rx="6" fill="#E9D5FF" />
            {/* Person - simple flat style */}
            <circle cx="160" cy="92" r="38" fill="#FDE68A" />
            <ellipse cx="160" cy="192" rx="52" ry="55" fill="#6366F1" />
            {/* Happy face */}
            <path d="M138 88 Q148 93 158 90" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M162 90 Q172 93 182 88" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M135 108 Q160 122 185 108" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Arms - raised / celebrating */}
            <path d="M115 135 L105 175 L120 180 L130 140 Z" fill="#FDE68A" stroke="#FCD34D" strokeWidth="1" />
            <path d="M205 135 L215 175 L200 180 L190 140 Z" fill="#FDE68A" stroke="#FCD34D" strokeWidth="1" />
            {/* Checkmarks on blocks */}
            <path d="M65 178 L72 186 L95 158" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M255 173 L262 181 L285 153" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Small sparkles */}
            <circle cx="75" y="130" r="4" fill="#F59E0B" opacity="0.7" />
            <circle cx="245" y="125" r="4" fill="#F59E0B" opacity="0.7" />
        </svg>
    );
}
