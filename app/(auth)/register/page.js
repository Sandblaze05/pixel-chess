'use client'

import { Sword, Crown, Shield, Sparkles, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [hoveredField, setHoveredField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear specific validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Password validation
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  // Form validation
  useEffect(() => {
    const errors = {};

    if (formData.username && formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = 'Password does not meet requirements';
      }
    }

    if (formData.confirmPassword !== '' && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);

    const isValid = formData.username.length >= 3 &&
      emailRegex.test(formData.email) &&
      formData.password &&
      validatePassword(formData.password).isValid &&
      formData.password === formData.confirmPassword;

    setIsFormValid(isValid);
  }, [formData]);

  const handleGoogleSignIn = () => {
    console.log('Google Sign-in initiated');
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleSubmit = async () => {
    if (isFormValid) {
      var username = formData.username;
      var email = formData.email;
      var password = formData.password;
      const res = await fetch('api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json();
      console.log('Registered:', data);
    }
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

      <div
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 text-amber-400 md:text-5xl z-50 flex items-center gap-1 border-2 border-amber-500/30 transition-colors cursor-pointer bg-slate-900/50 hover:bg-slate-800/50 backdrop-blur-lg px-3 py-1 rounded-md shadow-lg shadow-amber-500/20">
        <span className="medievalsharp-bold">{'<'}</span><span className="medievalsharp-bold block md:hidden">Back</span>
      </div>
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
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30 pointer-events-none absolute -top-6 sm:-top-8 md:-top-10 left-1/2 transform -translate-x-1/2 z-50"
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
            <span className="press-start-2p-bold">Welcome Challenger!</span>
          </motion.h1>

          <motion.p
            className="mt-2 text-xs sm:text-sm medievalsharp-regular text-slate-300 mb-4 sm:mb-6 text-center px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Create your account to embark on your chess adventure
          </motion.p>

          {/* Google Sign-in Button */}
          <motion.button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300 shadow-lg mb-4 text-sm sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </motion.button>

          <div className="flex items-center w-full mb-4">
            <div className="flex-1 border-t border-slate-600"></div>
            <span className="px-4 text-xs text-slate-400 medievalsharp-regular">OR</span>
            <div className="flex-1 border-t border-slate-600"></div>
          </div>

          <div className="w-full space-y-4">
            {[
              { id: 'username', label: 'Thy Name', type: 'text', placeholder: 'Enter your username' },
              { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
              { id: 'password', label: 'Password', type: showPassword ? 'text' : 'password', placeholder: 'Enter your password' },
              { id: 'confirmPassword', label: 'Confirm Password', type: showConfirmPassword ? 'text' : 'password', placeholder: 'Confirm your password' }
            ].map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <label htmlFor={field.id} className="block medievalsharp-regular text-xs sm:text-sm font-medium text-amber-200 mb-1">
                  {field.label}
                </label>
                <div className="relative">
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
                      : validationErrors[field.id]
                        ? 'border-red-500/80'
                        : 'border-amber-500/30'
                      }`}
                    placeholder={field.placeholder}
                  />

                  {/* Password visibility toggle */}
                  {(field.id === 'password' || field.id === 'confirmPassword') && (
                    <button
                      type="button"
                      onClick={() => field.id === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors duration-200"
                    >
                      {(field.id === 'password' ? showPassword : showConfirmPassword) ?
                        <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Error messages */}
                {validationErrors[field.id] && (
                  <motion.p
                    className="mt-1 text-xs text-red-400 medievalsharp-regular"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {validationErrors[field.id]}
                  </motion.p>
                )}
              </motion.div>
            ))}

            <motion.button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-4 font-bold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300 shadow-lg relative overflow-hidden text-sm sm:text-base medievalsharp-bold ${isFormValid
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:scale-105 hover:shadow-xl hover:shadow-amber-500/40 active:scale-98 cursor-pointer'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              whileHover={isFormValid ? {
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(245, 158, 11, 0.4)"
              } : {}}
              whileTap={isFormValid ? { scale: 0.98 } : {}}
            >
              {/* Button glow effect */}
              {isFormValid && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: [-100, 300] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              )}
              <Shield className={`w-4 h-4 sm:w-5 sm:h-5 ${isFormValid ? 'fill-white' : 'fill-slate-400'}`} />
              <span>Register</span>
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