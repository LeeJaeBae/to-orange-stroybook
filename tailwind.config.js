const fontSizeToken = (token, lineHeight) => [
  `var(--font-size-${token})`,
  { lineHeight },
];

const customFontSizeToken = (token) => `var(--font-size-${token})`;

const fontSize = {
  xs: fontSizeToken("xs", "1rem"),
  sm: fontSizeToken("sm", "1.25rem"),
  base: fontSizeToken("base", "1.5rem"),
  lg: fontSizeToken("lg", "1.75rem"),
  xl: fontSizeToken("xl", "1.75rem"),
  "2xl": fontSizeToken("2xl", "2rem"),
  "3xl": fontSizeToken("3xl", "2.25rem"),
  "4xl": fontSizeToken("4xl", "2.5rem"),
  "5xl": fontSizeToken("5xl", "1"),
  "6xl": fontSizeToken("6xl", "1"),
  "7xl": fontSizeToken("7xl", "1"),
  "8xl": fontSizeToken("8xl", "1"),
  "9xl": fontSizeToken("9xl", "1"),
  "size-2": customFontSizeToken("2"),
  "size-8": customFontSizeToken("8"),
  "size-9": customFontSizeToken("9"),
  "size-10": customFontSizeToken("10"),
  "size-11": customFontSizeToken("11"),
  "size-12": customFontSizeToken("12"),
  "size-12-8": customFontSizeToken("12-8"),
  "size-13": customFontSizeToken("13"),
  "size-14": customFontSizeToken("14"),
  "size-15": customFontSizeToken("15"),
  "size-16": customFontSizeToken("16"),
  "size-17": customFontSizeToken("17"),
  "size-18": customFontSizeToken("18"),
  "size-19": customFontSizeToken("19"),
  "size-20": customFontSizeToken("20"),
  "size-22": customFontSizeToken("22"),
  "size-24": customFontSizeToken("24"),
  "size-28": customFontSizeToken("28"),
  "size-28-8": customFontSizeToken("28-8"),
  "size-32": customFontSizeToken("32"),
  "size-34-4": customFontSizeToken("34-4"),
  "size-35-2": customFontSizeToken("35-2"),
  "size-36": customFontSizeToken("36"),
  "size-37-6": customFontSizeToken("37-6"),
  "size-44": customFontSizeToken("44"),
  "size-44-8": customFontSizeToken("44-8"),
  "size-48": customFontSizeToken("48"),
  "size-49-6": customFontSizeToken("49-6"),
  "size-50-4": customFontSizeToken("50-4"),
  "size-51-2": customFontSizeToken("51-2"),
  "size-52": customFontSizeToken("52"),
  "size-52-8": customFontSizeToken("52-8"),
  "size-70-4": customFontSizeToken("70-4"),
  "size-75-2": customFontSizeToken("75-2"),
};

/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      nav: "915px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    fontSize,
    extend: {
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        pretendard: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        "nanum-myeongjo": ['"Nanum Myeongjo"', "serif"],
        "nanum-pen": ['"Nanum Pen Script"', "cursive"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(142, 76%, 36%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        orange: {
          50: "hsl(var(--orange-50))",
          100: "hsl(var(--orange-100))",
          200: "hsl(var(--orange-200))",
          300: "hsl(var(--orange-300))",
          400: "hsl(var(--orange-400))",
          500: "hsl(var(--orange-500))",
          600: "hsl(var(--orange-600))",
          700: "#CC4A22",
          800: "#B33A19",
          900: "#992A10",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "var(--card-shadow)",
        "card-hover": "var(--card-shadow-hover)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(1deg)" },
          "75%": { transform: "rotate(-1deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "bounce-gentle": "bounce-gentle 1.5s ease-in-out infinite",
        wiggle: "wiggle 2s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float-delayed 8s ease-in-out infinite",
        "bounce-slow": "bounce-slow 4s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
