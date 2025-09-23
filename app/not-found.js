'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="text-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Animated Knight Image */}
          <motion.div
            animate={{ 
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block relative w-80 h-80 drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
            style={{
              filter: 'drop-shadow(0 0 15px rgba(59,130,246,0.3))'
            }}
          >
            <Image
              src="/king-piece.png"
              alt="Chess King"
              fill
              className="object-contain"
              priority
            />
          </motion.div>

          <h1 className="text-2xl md:text-4xl font-bold text-white press-start-2p-regular">
            404 - Page Not Found
          </h1>
          
          <p className="text-cyan-300 text-lg md:text-xl press-start-2p-regular">
            {"Oops! This move wasn't in our playbook."}
          </p>

          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 medievalsharp-regular 
              text-cyan-300 rounded-lg border border-cyan-500/30 transition-colors"
          >
            Back to reality lost one
          </Link>
        </motion.div>

        {/* Pixel Chess Pattern Background */}
        <motion.div
          className="absolute inset-0 opacity-10 -z-10"
          animate={{ opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{
            backgroundImage: `
              linear-gradient(45deg, cyan 25%, transparent 25%),
              linear-gradient(-45deg, cyan 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, cyan 75%),
              linear-gradient(-45deg, transparent 75%, cyan 75%)
            `,
            backgroundSize: '50px 50px',
            backgroundPosition: '0 0, 0 25px, 25px -25px, -25px 0px'
          }}
        />
      </div>
    </div>
  )
}