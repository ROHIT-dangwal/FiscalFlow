export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        sidebar: 'var(--sidebar)',
        card: 'var(--card)',
        border: 'var(--border)',

        primary: 'var(--primary)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',

        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)'
        }
      }
    }
  },
  plugins: [],
}