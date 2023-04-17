import { sveltekit } from '@sveltejs/kit/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vite';

export default defineConfig({
	server: { https: true }, // Needed for use of IndexedDB and OPFS
	plugins: [sveltekit(), basicSsl()],
	build: {
		target: 'esnext'
	}
});
