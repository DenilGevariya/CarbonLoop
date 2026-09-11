import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// 1. FadeIn Primitive
export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 0.4, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 2. FadeUp Primitive (Scroll / Entrance)
export const FadeUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 0.5, distance = 24, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 3. ScaleIn Primitive
export const ScaleIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 0.4, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 4. Stagger Container & Items
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  className?: string;
}> = ({ children, staggerChildren = 0.1, delayChildren = 0, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 5. Animated Counter
export const AnimatedCounter: React.FC<{
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}> = ({ value, suffix = '', prefix = '', decimals = 0, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    const durationMs = 1500;
    const startTime = performance.now();

    const updateCounter = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOutProgress;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value, shouldReduceMotion]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

// 6. HoverLift Button / Card container
export const HoverLift: React.FC<{
  children: React.ReactNode;
  y?: number;
  scale?: number;
  className?: string;
}> = ({ children, y = -4, scale = 1.01, className = '' }) => {
  return (
    <motion.div
      whileHover={{ y, scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
