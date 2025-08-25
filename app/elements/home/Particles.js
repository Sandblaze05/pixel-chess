import React from 'react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

const Particles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(Array.from({ length: 30 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          background: `hsl(${210 + Math.random() * 60}, 70%, ${60 + Math.random() * 30}%)`,
          width: Math.random() * 6 + 2,
          height: Math.random() * 6 + 2,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`
        }}
        animate={{
          y: [0, -100 - Math.random() * 200, 0],
          x: [0, Math.sin(i) * 100, 0],
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: "easeInOut"
        }}
      />
    )))
  }, []);

  return (
    <div className="absolute inset-0 opacity-20 z-0">
      {particles}
    </div>
  )
}

export default Particles