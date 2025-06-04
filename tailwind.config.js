// tailwind.config.js
module.exports = {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
			colors: {
        primary: "#4F46E5",
        secondary: "#4B5563",
      },
			fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
  		borderRadius: {
  			lg: '8px',
  			md: '6px',
  			sm: '4px'
  		},
  	}
  },
  plugins: [
    	require("@tailwindcss/forms"),
      require("tailwindcss-animate"),
			require("@tailwindcss/typography")
],
};
