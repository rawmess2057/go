'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

type Intensity = 'sm' | 'md' | 'lg';

interface LiquidGlassCardProps {
  glowIntensity?: Intensity;
  shadowIntensity?: Intensity;
  borderRadius?: string;
  blurIntensity?: Intensity;
  draggable?: boolean;
  className?: string;
  children: React.ReactNode;
}

const blurValues = { sm: '4px', md: '12px', lg: '24px' };
const glowValues: Record<Intensity, string> = {
  sm: '0 0 8px rgba(85, 210, 146, 0.15)',
  md: '0 0 16px rgba(85, 210, 146, 0.25)',
  lg: '0 0 32px rgba(85, 210, 146, 0.35)',
};
const shadowValues: Record<Intensity, string> = {
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  md: '0 4px 12px rgba(0,0,0,0.12)',
  lg: '0 8px 24px rgba(0,0,0,0.16)',
};

export function LiquidGlassCard({
  glowIntensity = 'sm',
  shadowIntensity = 'sm',
  borderRadius = '12px',
  blurIntensity = 'sm',
  draggable = false,
  className,
  children,
}: LiquidGlassCardProps) {
  return (
    <motion.div
      drag={draggable}
      whileDrag={draggable ? { scale: 1.02, cursor: 'grabbing' } : undefined}
      className={cn(
        'relative overflow-hidden',
        'bg-white/15',
        'border border-white/20',
        className
      )}
      style={{
        borderRadius,
        boxShadow: `${glowValues[glowIntensity]}, ${shadowValues[shadowIntensity]}`,
        backdropFilter: `blur(${blurValues[blurIntensity]})`,
        WebkitBackdropFilter: `blur(${blurValues[blurIntensity]})`,
      }}
    >
      {children}
    </motion.div>
  );
}
