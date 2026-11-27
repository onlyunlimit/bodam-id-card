// Generates assets/archive.tw.css — Tailwind utilities scoped under `.tw` for the
// personnel badge/file, AZ case file and Lucky Trick pages. No preflight: the portal keeps
// its own base styles. Regenerate after changing classes in the listed modules:
//   npx tailwindcss@3.4.17 -c scripts/tailwind.archive.config.cjs -i scripts/tailwind.archive.css -o assets/archive.tw.css --minify
module.exports = {
  content: ['./assets/id-badge.js', './assets/member-archive.js', './assets/lucky-page.js', './assets/lucky-data.js', './assets/obsidus-data.js'],
  important: '.tw',
  corePlugins: { preflight: false },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Oswald', 'Syne', 'Inter', 'sans-serif'],
        editorial: ['Cormorant Garamond', 'serif'],
        serif: ['Cormorant Garamond', 'Nanum Myeongjo', 'serif'],
        myeongjo: ['Nanum Myeongjo', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        pen: ['Nanum Pen Script', 'cursive'],
        gaegu: ['Gaegu', 'cursive'],
      },
    },
  },
};
