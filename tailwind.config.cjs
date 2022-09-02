/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#264653",
        secondary: "#2a9d8f",
        tirtiary: "#f4a261",
        accent1: "#e76f51",
        accent2: "#e9c46a",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
