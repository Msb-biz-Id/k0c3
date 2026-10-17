import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ScoreOdometerProps {
    value: number | string;
    className?: string;
}

export default function ScoreOdometer({ value, className = '' }: ScoreOdometerProps) {
    return (
        <div className={`relative h-9 min-w-6 overflow-hidden inline-flex items-center justify-center font-mono font-black text-2xl text-accent-primary ${className}`}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={String(value)}
                    initial={{ y: -18, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 18, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex items-center justify-center"
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}
