import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        work: "#0f766e",
        alert: "#b45309",
        field: "#f8fafc"
      }
    }
  },
  plugins: []
};

export default config;
