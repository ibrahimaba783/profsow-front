import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Composant d'apparition fluide au scroll.
 * Animé uniquement sur opacity et transform (y/x) pour une performance 60fps optimale.
 * Respecte automatiquement 'prefers-reduced-motion'.
 *
 * @param {React.ReactNode} children - Contenu à animer
 * @param {number} delay - Délai d'apparition en secondes (ex: 0.1, 0.2)
 * @param {number} duration - Durée de l'animation en secondes (défaut: 0.5s)
 * @param {string} direction - 'up' (défaut), 'down', 'left', 'right', ou 'none'
 * @param {string} className - Classes Tailwind optionnelles
 * @param {boolean} once - Si true, ne s'anime qu'une seule fois (défaut: true)
 */
export const Reveal = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  className = '',
  once = true,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Si l'utilisateur préfère réduire les animations, rendu direct sans transformation
  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  const offset = 24;

  const initialVariant = {
    opacity: 0,
    y: direction === 'up' ? offset : direction === 'down' ? -offset : 0,
    x: direction === 'left' ? offset : direction === 'right' ? -offset : 0,
  };

  const animateVariant = {
    opacity: 1,
    y: 0,
    x: 0,
  };

  return (
    <motion.div
      initial={initialVariant}
      whileInView={animateVariant}
      viewport={{ once, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
