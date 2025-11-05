// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  // 1. Tell Tailwind where to find your files to scan for classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundSize: {
        '20px_20px': '20px 20px',
      },
    },
  },
  
  // 2. Safelist the dynamic classes to fix the issue
  safelist: [
    // Shadow classes
    'shadow-blue-500/40',
    'shadow-red-500/40',
    
    // Gradient from classes
    'from-blue-500',
    'from-red-500',
    
    // Gradient via classes
    'via-blue-600',
    'via-red-600',
    
    // Gradient to classes
    'to-blue-700',
    'to-red-700',
    
    // Border classes
    'border-blue-400/30',
    'border-red-400/30',

    'perspective',
    'card-inner',
    'card-face',
    'card-front',
    'card-back',
    'flipped',
  ],
  
  plugins: [],
}