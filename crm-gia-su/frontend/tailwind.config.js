/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crm: {
          primary: "#4F46E5", // Indigo 600
          secondary: "#06B6D4", // Cyan 500
          dark: "#1E1B4B", // Indigo 950
          success: "#10B981", // Emerald 500
          danger: "#EF4444", // Red 500
        }
      }
    },
  },
  plugins: [],
}
