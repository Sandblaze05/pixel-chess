'use client'

import React, { useRef } from 'react'
import { motion } from 'motion/react'
import { Sword, Crown, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useInView } from 'motion/react'

const Header = () => {
  const router = useRouter()
  const heroRef = useRef(null)
  const isInView = useInView(heroRef, { margin: "0px", once: false });
  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={isInView ? { y: -80, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-slate-900/80 border-b border-cyan-500/30 backdrop-blur-xl text-white p-4 shadow-2xl shadow-cyan-500/20 fixed w-full top-0 z-50"
      >
        <div className="flex relative items-center mb-2 w-fit">
          <motion.h1
            className="text-md md:text-lg font-black text-white press-start-2p-regular tracking-tight"
            animate={{
              textShadow: [
                "0 0 20px #00ffff",
                "0 0 25px #00ffff",
                "0 0 20px #00ffff"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            PIXEL <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-transparent bg-clip-text">CHESS</span>
          </motion.h1>
          <motion.div
            animate={{ rotate: 10 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
            className="absolute left-1/2 top-1/2 -z-20 -translate-x-1/2 -translate-y-1/2"
          >
            <Sword className="inline-block fill-cyan-400/20 stroke-cyan-100 stroke-2" />
          </motion.div>
        </div>
      </motion.header>
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20" ref={heroRef}>
        <div className="absolute inset-0 bg-[url('/pixelated-castle-sunset.jpg')] bg-cover bg-no-repeat bg-center opacity-30 pixel-art "></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="mb-8">
            <Badge className="mb-5 bg-transparent/20 border-1 border-blue-400 text-primary-foreground font-bold px-4 py-2 retro-shadow">
              🏰 MEDIEVAL CHESS ADVENTURES
            </Badge>
            <h1 className="text-4xl md:text-8xl font-black text-foreground mb-6 press-start-2p-bold tracking-tight">
              PIXEL<span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">CHESS</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-[family-name:var(--font-open-sans)]">
              {"Master the ancient game of kings in our retro 8-bit medieval realm"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div
              whileHover={{ y: -5, x: -5, scale: 1.01 }}
              whileTap={{ y: 5, x: 5, scale: 0.98 }}
              transition={{ type: "tween", ease: "easeOut" }}
              onClick={() => router.push('/register')}
            >
              <Button
                size="lg"
                className="bg-primary text-primary-foreground font-bold px-8 py-4 text-lg retro-shadow retro-shadow-hover transition-shadow"
              >
                <Crown className="mr-2 h-5 w-5" />
                Start Your Quest
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, x: -5, scale: 1.01 }}
              whileTap={{ y: 5, x: 5, scale: 0.98 }}
              transition={{ type: "tween", ease: "easeOut" }}
            >
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-border font-bold px-8 py-4 retro-shadow retro-shadow-hover text-lg bg-secondary"
              >
                <Users className="mr-2 h-5 w-5" />
                Join Tournament
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Header