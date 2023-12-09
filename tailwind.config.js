module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors:{
        'disabled-gray': '#E8E8E8',
        'delete-blue': '#E3EBF8',
        'delete-text-blue': '#294FB8',
      },
    },
  },
  plugins: [],
  corePlugins: require('tailwind-rn/unsupported-core-plugins'),
};