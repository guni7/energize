module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  variants: {
    extend: {
      backgroundColor: ["checked"],
      borderColor: ["checked"]
    },
  },
  theme: {
    extend: {
      fontFamily: {
        Rampart: ['VT323', 'monospace'],
      },
    },
  },
  plugins: [],
}
