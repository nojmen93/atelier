'use client'
import { motion, Variants } from 'framer-motion';
import React from 'react';

interface ImageRevealProps {
  leftImage: string;
  middleImage: string;
  rightImage: string;
}

export function ImageReveal({ leftImage, middleImage, rightImage }: ImageRevealProps) {
  const containerVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { delay: 0.2, staggerChildren: 0.2 },
    },
  };

  const leftVariants: Variants = {
    initial: { rotate: 0, x: 0, y: 0 },
    animate: {
      rotate: -8,
      x: -150,
      y: 10,
      transition: { type: 'spring', stiffness: 120, damping: 12 },
    },
    hover: {
      rotate: 1,
      x: -160,
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 15 },
    },
  };

  const middleVariants: Variants = {
    initial: { rotate: 0, x: 0, y: 0 },
    animate: {
      rotate: 6,
      x: 0,
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 12 },
    },
    hover: {
      rotate: 0,
      x: 0,
      y: -10,
      transition: { type: 'spring', stiffness: 200, damping: 15 },
    },
  };

  const rightVariants: Variants = {
    initial: { rotate: 0, x: 0, y: 0 },
    animate: {
      rotate: -6,
      x: 200,
      y: 20,
      transition: { type: 'spring', stiffness: 120, damping: 12 },
    },
    hover: {
      rotate: 3,
      x: 200,
      y: 10,
      transition: { type: 'spring', stiffness: 200, damping: 15 },
    },
  };

  const cardStyle: React.CSSProperties = {
    position: 'absolute',
    width: 192,
    height: 192,
    overflow: 'hidden',
    borderRadius: 12,
    boxShadow: '0 10px 32px rgba(0,0,0,0.18)',
    background: '#fff',
  };

  const imgStyle: React.CSSProperties = {
    objectFit: 'cover',
    padding: 8,
    borderRadius: 12,
    width: '100%',
    height: '100%',
    display: 'block',
  };

  return (
    <motion.div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 280,
        height: 280,
      }}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Left */}
      <motion.div
        style={{ ...cardStyle, transformOrigin: 'bottom right', zIndex: 30 }}
        variants={leftVariants}
        whileHover="hover"
        animate="animate"
      >
        <img src={leftImage} alt="" style={imgStyle} />
      </motion.div>

      {/* Middle */}
      <motion.div
        style={{ ...cardStyle, transformOrigin: 'bottom left', zIndex: 20 }}
        variants={middleVariants}
        whileHover="hover"
        animate="animate"
      >
        <img src={middleImage} alt="" style={imgStyle} />
      </motion.div>

      {/* Right */}
      <motion.div
        style={{ ...cardStyle, transformOrigin: 'bottom right', zIndex: 10 }}
        variants={rightVariants}
        whileHover="hover"
        animate="animate"
      >
        <img src={rightImage} alt="" style={imgStyle} />
      </motion.div>
    </motion.div>
  );
}
