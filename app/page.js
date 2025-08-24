'use client'

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Sword, Shield, Users, Trophy, Zap, Star } from "lucide-react"
import { motion, useInView } from "motion/react"
import { useRouter } from "next/navigation"

export default function Home() {
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { margin: "0px", once: false });
  const router = useRouter();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative">

      <div className="fixed inset-0 opacity-20 z-0">
        {particles}
      </div>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={isInView ? { y: -80, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-slate-900/80 border-b border-cyan-500/30 backdrop-blur-xl text-white p-4 shadow-2xl shadow-cyan-500/20 fixed w-full top-0 z-50"
      >
        <div className="flex relative items-center mb-2 w-fit">
          <motion.h1
            className="text-md md:text-lg font-black text-white tracking-tight"
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20" ref={heroRef}>
        <div className="absolute inset-0 bg-[url('/pixelated-castle-sunset.jpg')] bg-cover bg-no-repeat bg-center opacity-30 pixel-art "></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-transparent/20 border-1 border-blue-400 text-primary-foreground font-bold px-4 py-2 retro-shadow">
              🏰 MEDIEVAL CHESS ADVENTURES
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black text-foreground mb-6 font-[family-name:var(--font-montserrat)] tracking-tight">
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

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-slate-900/50 relative">
        <motion.div
          className="absolute inset-0 opacity-10"
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
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              <motion.span
                animate={{
                  backgroundPosition: ["0%", "100%"],
                }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-[length:200%_100%] text-transparent bg-clip-text"
              >
                Choose Your Path
              </motion.span>
            </h2>
            <p className="text-lg text-cyan-100 max-w-2xl mx-auto">
              From novice squire to grandmaster knight, forge your legend in our <span className="text-purple-300">electrifying</span> pixelated kingdom
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Sword,
                title: "Knight Training",
                description: "Master chess fundamentals with our interactive neon tutorials",
                color: "from-cyan-500 to-blue-600",
                items: ["Electrifying piece movement guides", "Neon-lit chess puzzles", "Power-up skill challenges", "Earn lightning badges & achievements"]
              },
              {
                icon: Shield,
                title: "Castle Defense",
                description: "Battle AI opponents in our charged medieval arenas",
                color: "from-purple-500 to-pink-600",
                items: ["Multiple AI intensity levels", "Glowing battlegrounds & castles", "Supercharged game modes", "Unlock plasma piece skins"]
              },
              {
                icon: Trophy,
                title: "Royal Tournament",
                description: "Compete against players in high-voltage chess battles",
                color: "from-yellow-500 to-orange-600",
                items: ["Ranked lightning matches", "Seasonal storms & events", "Electric guild battles", "Dominate the power leaderboards"]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -10,
                  scale: 1.02
                }}
                className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-cyan-500/30 rounded-xl backdrop-blur-md overflow-hidden"
              >
                {/* Glowing border effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(6, 182, 212, 0.3)",
                      "0 0 40px rgba(168, 85, 247, 0.3)",
                      "0 0 20px rgba(6, 182, 212, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <div className="relative p-6">
                  <div className="text-center pb-4">
                    <motion.div
                      className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center shadow-lg`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.div
                        animate={{
                          rotate: [0, -15, 15, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <feature.icon className="h-8 w-8 text-white" />
                      </motion.div>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-cyan-200 text-sm">{feature.description}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-cyan-100">
                    {feature.items.map((item, i) => (
                      <motion.li
                        key={i}
                        className="flex items-center gap-2"
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2 font-[family-name:var(--font-montserrat)]">
                50K+
              </div>
              <div className="text-muted-foreground font-[family-name:var(--font-open-sans)]">Knights Trained</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-secondary mb-2 font-[family-name:var(--font-montserrat)]">
                1M+
              </div>
              <div className="text-muted-foreground font-[family-name:var(--font-open-sans)]">Battles Fought</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-accent mb-2 font-[family-name:var(--font-montserrat)]">
                100+
              </div>
              <div className="text-muted-foreground font-[family-name:var(--font-open-sans)]">Tournaments</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2 font-[family-name:var(--font-montserrat)]">
                24/7
              </div>
              <div className="text-muted-foreground font-[family-name:var(--font-open-sans)]">Castle Open</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              className="text-4xl md:text-5xl font-black text-white mb-6"
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              viewport={{ once: true }}
            >
              <motion.span
                animate={{
                  textShadow: [
                    "0 0 30px #00ffff, 0 0 60px #00ffff",
                    "0 0 50px #9333ea, 0 0 80px #9333ea",
                    "0 0 30px #00ffff, 0 0 60px #00ffff"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Ready to Rule the Board?
              </motion.span>
            </motion.h2>
            <p className="text-xl text-muted-foreground mb-8 font-[family-name:var(--font-open-sans)]">
              {"Join thousands of players in the ultimate 8-bit chess experience. Your medieval adventure awaits!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 retro-shadow text-lg"
              >
                <Zap className="mr-2 h-5 w-5" />
                Play Now - Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-border hover:bg-muted hover:text-foreground font-bold px-8 py-4 retro-shadow text-lg bg-transparent"
              >
                Watch Gameplay
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-black mb-4 font-[family-name:var(--font-montserrat)]">PixelChess</h3>
              <p className="text-primary-foreground/80 font-[family-name:var(--font-open-sans)]">
                The ultimate 8-bit medieval chess experience for players of all skill levels.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 font-[family-name:var(--font-montserrat)]">Game Modes</h4>
              <ul className="space-y-2 text-primary-foreground/80 font-[family-name:var(--font-open-sans)]">
                <li>Training Grounds</li>
                <li>AI Battles</li>
                <li>Multiplayer</li>
                <li>Tournaments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 font-[family-name:var(--font-montserrat)]">Community</h4>
              <ul className="space-y-2 text-primary-foreground/80 font-[family-name:var(--font-open-sans)]">
                <li>Discord Server</li>
                <li>Forums</li>
                <li>Leaderboards</li>
                <li>Guild System</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 font-[family-name:var(--font-montserrat)]">Support</h4>
              <ul className="space-y-2 text-primary-foreground/80 font-[family-name:var(--font-open-sans)]">
                <li>Help Center</li>
                <li>Bug Reports</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60 font-[family-name:var(--font-open-sans)]">
            <p>© 2025 PixelChess. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
