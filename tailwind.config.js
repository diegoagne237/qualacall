/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0a0a0b",
        panel: "#131418",
        panelAlt: "#1c1d22",
        card: "#202127",
        line: "#2b2c33",
        lineSoft: "#1f2025",
        orange: "#e59435",
        orangeDim: "#7a5220",
        ctblue: "#5f89b3",
        ctblueDim: "#2a3d4d",
        green: "#5cb87a",
        red: "#d1554f",
        textPrimary: "#eef0f3",
        textMuted: "#8a8c93",
        textFaint: "#54555c",
      },
      fontFamily: {
        display: ["Oswald", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
