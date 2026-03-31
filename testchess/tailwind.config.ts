const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "dark-gradient": "linear-gradient(145deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)",
      },
      boxShadow: {
        "neomorphic": "8px 8px 16px #0a0a0f, -8px -8px 16px #1a1a2e",
        "neomorphic-inset": "inset 8px 8px 16px #0a0a0f, inset -8px -8px 16px #1a1a2e",
      },
    },
  },
  plugins: [],
};
export default config;
