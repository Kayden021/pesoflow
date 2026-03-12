/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        shell: "#081425",
        panel: "#0f213a",
        panelSoft: "#152d4d",
        accent: "#00c08b",
        danger: "#ff5a5f",
        textMain: "#e6eef9",
        textDim: "#9fb4cf"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0, 192, 139, 0.2), 0 12px 30px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
