import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        control: "#1d4ed8",
        risk: "#be123c",
        field: "#f8fafc"
      }
    }
  },
  plugins: []
};

export default config;
