'use client'

import { Sword, Crown, Shield, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [hoveredField, setHoveredField] = useState(null);
  const router = useRouter();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Floating particles animation
  const [particles, setParticles] = useState([]);
  useEffect(() => { // use useEffect otherwise hydration error
    setParticles(Array.from({ length: 20 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-amber-400 rounded-full opacity-60"
        animate={{
          y: [0, -100, 0],
          x: [0, Math.sin(i) * 50, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2
        }}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`
        }}
      />
    )));
  }, []);

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-slate-900 via-slate-800 to-amber-900/30 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles}
      </div>

      {/* Pulsing background overlay */}
      <motion.div
        className="absolute inset-0 bg-[url('/dark-fantasy-pixel-art-v0-tfrugafbw19c1.webp')] bg-cover"
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Floating chess pieces in background*/}
      <motion.div
        className="absolute top-10 sm:top-20 left-5 sm:left-10 opacity-20"
        animate={{
          rotate: 360,
          y: [0, -20, 0]
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          y: { duration: 3, repeat: Infinity }
        }}
      >
        <Crown className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-amber-400" />
      </motion.div>

      <motion.div
        className="absolute bottom-20 sm:bottom-32 right-5 sm:right-20 opacity-20"
        animate={{
          rotate: -360,
          y: [0, 15, 0]
        }}
        transition={{
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
          y: { duration: 4, repeat: Infinity }
        }}
      >
        <Shield className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-blue-400" />
      </motion.div>

      <header className="bg-slate-900/80 border-b border-cyan-500/30 backdrop-blur-xl text-white p-4 shadow-2xl shadow-cyan-500/20 fixed w-full top-0 z-50">
        <div className="flex relative items-center mb-2 w-fit">
          <motion.h1
            onClick={() => router.push('/')}
            className="text-md md:text-lg font-black text-white tracking-tight cursor-pointer"
            animate={{
              textShadow: [
                "0 0 20px #00ffff",
                "0 0 25px #00ffff",
                "0 0 20px #00ffff"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            PIXEL <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-red-500 text-transparent bg-clip-text">CHESS</span>
          </motion.h1>
          <motion.div
            animate={{ rotate: 10 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
            className="absolute left-1/2 top-1/2 -z-20 -translate-x-1/2 -translate-y-1/2"
          >
            <Sword className="inline-block fill-amber-400/20 stroke-amber-100 stroke-2" />
          </motion.div>
        </div>
      </header>
      <div className="relative z-10 flex flex-col lg:flex-row-reverse justify-center lg:justify-between items-center p-4 lg:p-6 min-h-screen gap-8 lg:gap-0 px-4 lg:px-30">
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
          className="flex flex-col items-center justify-center pt-16 sm:pt-20 bg-slate-900/90 backdrop-blur-lg border-2 border-amber-500/30 rounded-lg p-6 sm:p-8 w-full max-w-md shadow-2xl shadow-amber-500/20 relative"
        >
          {/* Glowing border effect */}
          <motion.div
            className="absolute inset-0 rounded-lg opacity-30 -z-10"
            animate={{
              boxShadow: [
                "0 0 20px rgba(245, 158, 11, 0.5)",
                "0 0 40px rgba(245, 158, 11, 0.8)",
                "0 0 20px rgba(245, 158, 11, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Animated torch */}
          <motion.img
            src="/Torch_Gif.gif"
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30 pointer-events-none absolute -top-12 sm:-top-14 md:-top-16 left-1/2 transform -translate-x-1/2 z-50"
            animate={{
              filter: [
                "drop-shadow(0 0 35px orange)",
                "drop-shadow(0 0 50px #ff6b35)",
                "drop-shadow(0 0 35px orange)"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Sparkling effect around torch */}
          <motion.div
            className="absolute -top-8 sm:-top-10 md:-top-12 left-1/2 transform -translate-x-1/2 z-50"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-400 opacity-70" />
          </motion.div>

          <motion.h1
            className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent text-center"
            animate={{
              textShadow: [
                "0 0 10px rgba(245, 158, 11, 0.5)",
                "0 0 20px rgba(245, 158, 11, 0.8)",
                "0 0 10px rgba(245, 158, 11, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Welcome Challenger!
          </motion.h1>

          <motion.p
            className="mt-2 text-xs sm:text-sm text-slate-300 mb-4 sm:mb-6 text-center px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Create your account to embark on your chess adventure
          </motion.p>

          <div className="w-full space-y-4">
            {[
              { id: 'username', label: 'Thy Name', type: 'text', placeholder: 'Enter your username' },
              { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
              { id: 'password', label: 'Password', type: 'password', placeholder: 'Enter your password' }
            ].map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <label htmlFor={field.id} className="block text-xs sm:text-sm font-medium text-amber-200 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  id={field.id}
                  name={field.id}
                  value={formData[field.id]}
                  onChange={handleInputChange}
                  onFocus={() => setHoveredField(field.id)}
                  onBlur={() => setHoveredField(null)}
                  className={`mt-1 block w-full px-3 py-2 sm:py-3 bg-slate-800/80 border-2 rounded-md shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white transition-all duration-300 text-sm sm:text-base ${hoveredField === field.id
                    ? 'border-amber-500/80 scale-[1.02] shadow-lg shadow-amber-500/20'
                    : 'border-amber-500/30'
                    }`}
                  placeholder={field.placeholder}
                />
              </motion.div>
            ))}

            <motion.button
              onClick={() => console.log('Registration submitted:', formData)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300 shadow-lg relative overflow-hidden hover:scale-105 hover:shadow-xl hover:shadow-amber-500/40 active:scale-98 text-sm sm:text-base cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(245, 158, 11, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: [-100, 300] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              Register
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced knight piece with animations */}
        <motion.div
          initial={{ opacity: 0, x: -100, rotate: -10 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{
            scale: 1.05,
            rotate: 2,
            filter: "drop-shadow(0 0 30px rgba(245, 158, 11, 0.6))"
          }}
          className="relative hidden lg:block"
        >
          <motion.div
            className="bg-[url('/knight-piece.png')] bg-cover w-64 h-64 lg:w-80 lg:h-80 xl:w-100 xl:h-100 relative"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Aura of the knight */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-30"
              animate={{
                boxShadow: [
                  "0 0 40px rgba(245, 158, 11, 0.3)",
                  "0 0 80px rgba(245, 158, 11, 0.6)",
                  "0 0 40px rgba(245, 158, 11, 0.3)"
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z'/%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
    </div>
  );
}