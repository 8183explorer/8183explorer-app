/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        concrete: '#E8E4E0',
        cream: '#F5F2EB',
        yellow: {
          DEFAULT: '#F5C518',
          brand: '#FFD600',
          hover: '#E0B416'
        },
        red: {
          alert: '#FF3333',
        },
        danger: '#FF3333',
        safe: '#00CC66',
        warning: '#FF9900'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'brutal': '8px 8px 0px 0px rgba(0,0,0,1)',
        'brutal-sm': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brutal-white': '8px 8px 0px 0px rgba(255,255,255,1)',
        'brutal-yellow': '8px 8px 0px 0px #F5C518',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '8': '8px',
      }
    }
  },
  plugins: [],
}
