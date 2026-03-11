'use client';

import { motion } from 'framer-motion';

const CursorIcon = ({ isClicking }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
        <path
            d="M5 3L5 21L10 16L14 22L17 21L13 15L19 14L5 3Z"
            fill="white"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            className="text-slate-800"
        />
    </svg>
);

export function CursorOverlay({ pos, visible, isClicking }) {
    if (!visible) return null;

    return (
        <motion.div
            className="absolute z-50 pointer-events-none"
            initial={false}
            animate={{
                x: pos.x - 2,
                y: pos.y - 2,
                scale: isClicking ? 0.9 : 1,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        >
            <CursorIcon isClicking={isClicking} />
        </motion.div>
    );
}
