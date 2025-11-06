export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0e1a',
          card: '#0f1419',
          hover: '#1a1f2e'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-blue': 'linear-gradient(135deg, #667eea 0%, #5899E2 100%)',
        'gradient-purple': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      }
    },
  },
  plugins: [],
}
