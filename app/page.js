'use client'

import { Button } from "@/components/ui/button"
import { Sword, Shield, Trophy, Zap, Star } from "lucide-react"
import { motion } from "motion/react"
import Header from "./elements/home/Header"
import Particles from "./elements/home/Particles"

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-x-hidden">
      <Header />
      <div className="absolute w-full h-2 bg-gray-500"></div> 
      <main className="relative z-10">
        <Particles />
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
        <motion.img
          src="/blue-flame.gif"
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30 pointer-events-none absolute -top-12 sm:-top-14 md:-top-16 left-1/2 transform -translate-x-1/2 z-50"
          animate={{
            filter: [
              "drop-shadow(0 0 35px cyan)",
              "drop-shadow(0 0 50px cyan)",
              "drop-shadow(0 0 35px cyan)"
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Features Section */}
        <section className="py-20 bg-transparent relative">
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

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r bg-transparent">
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
                      "0 0 30px #00ffff",
                      "0 0 50px #9333ea",
                      "0 0 30px #00ffff"
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 retro-shadow text-lg z-10"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Play Now - Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-border hover:bg-muted hover:text-foreground font-bold px-8 py-4 retro-shadow text-lg bg-transparent z-10"
                >
                  Watch Gameplay
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-black mb-4 press-start-2p-bold">PixelChess</h3>
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
