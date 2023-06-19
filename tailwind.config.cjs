/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    // "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#385968",
        secondary: "#84A8A3",
        tirtiary: "#CD7660",
        accent1: "#e76f51",
        accent2: "#e9c46a",
      },
      margin: {
        3.5: "-3.5vw",
      },
      screens: {
        pwa: { raw: "(display-mode: standalone)" },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
