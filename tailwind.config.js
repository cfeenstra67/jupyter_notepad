/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    borderWidth: {
      DEFAULT: 'var(--jp-border-width, 1px)'
    },
    colors: {
      cellBorder: {
        DEFAULT: 'var(--jp-cell-editor-border-color, #616161)'
      },
      cellBackground: {
        DEFAULT: 'var(--jp-cell-editor-background, #212121)'
      },
      font1: {
        DEFAULT: 'var(--jp-content-font-color1, rgba(255, 255, 255, 1))'
      },
      font3: {
        DEFAULT: 'var(--jp-content-font-color3, rgba(255, 255, 255, 0.5))'
      }
    },
    extend: {},
  },
  plugins: [],
}
