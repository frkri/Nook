/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			inherit: 'inherit',

			background: '#000000',
			foreground: '#ffffff',
			accents1: '#111',
			accents2: '#333',
			accents3: '#444',
			accents4: '#666',
			accents5: '#888',
			accents6: '#999',
			accents7: '#eaeaea',
			accents8: '#fafafa',

			primary: '#fff',
			secondary: '#888',

			alert: '#ff0000',
			warn: '#f5a623'
		}
	},
	plugins: [require('@tailwindcss/typography')]
};
