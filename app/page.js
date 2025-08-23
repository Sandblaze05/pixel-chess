'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Sword, Shield, Users, Trophy, Zap } from "lucide-react"
import { motion } from "motion/react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="absolute inset-0 bg-[url('/pixelated-castle-sunset.jpg')] bg-cover bg-no-repeat bg-center opacity-30 pixel-art "></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-primary text-primary-foreground font-bold px-4 py-2 retro-shadow">
              🏰 MEDIEVAL CHESS ADVENTURES
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black text-foreground mb-6 font-[family-name:var(--font-montserrat)] tracking-tight">
              PIXEL<span className="bg-gradient-to-r from-primary to-pink-600 text-transparent bg-clip-text">CHESS</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-[family-name:var(--font-open-sans)]">
              {"Master the ancient game of kings in our retro 8-bit medieval realm"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div
              whileHover={{ y: -5, x: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "tween", ease: "easeOut" }}
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
              whileHover={{ y: -5, x: -5, scale: 1.05 }}
              transition={{ type: "tween", ease: "easeOut" }}
            >
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-border hover:bg-secondary hover:text-secondary-foreground font-bold px-8 py-4 retro-shadow retro-shadow-hover text-lg bg-transparent"
              >
                <Users className="mr-2 h-5 w-5" />
                Join Tournament
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 font-[family-name:var(--font-montserrat)]">
              Choose Your Path
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-[family-name:var(--font-open-sans)]">
              From novice squire to grandmaster knight, forge your legend in our pixelated kingdom
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-card border-2 border-border retro-shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-lg flex items-center justify-center retro-shadow">
                  <Sword className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold text-card-foreground font-[family-name:var(--font-montserrat)]">
                  Knight Training
                </CardTitle>
                <CardDescription className="text-muted-foreground font-[family-name:var(--font-open-sans)]">
                  Master chess fundamentals with our interactive 8-bit tutorials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground font-[family-name:var(--font-open-sans)]">
                  <li>• Pixel-perfect piece movement guides</li>
                  <li>• Medieval-themed chess puzzles</li>
                  <li>• Progressive skill challenges</li>
                  <li>• Earn knight badges & achievements</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-2 border-border retro-shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-lg flex items-center justify-center retro-shadow">
                  <Shield className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold text-card-foreground font-[family-name:var(--font-montserrat)]">
                  Castle Defense
                </CardTitle>
                <CardDescription className="text-muted-foreground font-[family-name:var(--font-open-sans)]">
                  Battle AI opponents in our pixelated medieval arenas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground font-[family-name:var(--font-open-sans)]">
                  <li>• Multiple AI difficulty levels</li>
                  <li>• Themed battlegrounds & castles</li>
                  <li>• Special game modes & variants</li>
                  <li>• Unlock new chess piece skins</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-2 border-border retro-shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded-lg flex items-center justify-center retro-shadow">
                  <Trophy className="h-8 w-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold text-card-foreground font-[family-name:var(--font-montserrat)]">
                  Royal Tournament
                </CardTitle>
                <CardDescription className="text-muted-foreground font-[family-name:var(--font-open-sans)]">
                  Compete against players worldwide in epic chess battles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground font-[family-name:var(--font-open-sans)]">
                  <li>• Ranked multiplayer matches</li>
                  <li>• Seasonal tournaments & events</li>
                  <li>• Guild system & team battles</li>
                  <li>• Climb the royal leaderboards</li>
                </ul>
              </CardContent>
            </Card>
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
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 font-[family-name:var(--font-montserrat)]">
              Ready to Rule the Board?
            </h2>
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
            <p>© 2024 PixelChess. All rights reserved. Made with ⚔️ for chess lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
