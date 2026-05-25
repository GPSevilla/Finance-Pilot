import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f4f7fb",
        slateblue: "#2751c3",
        sea: "#0f766e",
        amberglow: "#d97706",
        rosewood: "#be123c"
      },
      boxShadow: {
        panel: "0 20px 45px rgba(15, 23, 42, 0.09)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
} satisfies Config;
