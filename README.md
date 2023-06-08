# 📝 Nook

⚠️ Learning Project! ⚠️

Basic notetaking app (clientside and fully offline) made with [SvelteKit](https://kit.svelte.dev), it features an editor with markdown support and an explorer with a file system-like browser.

It uses [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API#origin_private_file_system) and [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) for storage.

Design based on [Geist](https://github.com/geist-org/geist-ui), originating from [Vercel's design system](https://vercel.com/design/introduction).

## Live Deployment

[nook-dot.vercel.app](https://nook-dot.vercel.app) on master branch

## Getting started

_Make sure you have [Node.js](https://nodejs.org) (v16 or v18) installed to run locally!_

_Optional: [PNPM](https://pnpm.io/) instead of NPM_

```bash
git clone https://github.com/frkri/Nook.git
cd Nook
npm install
```

## Building and running

Dev: Starts Vite server and opens site in browser

```bash
npm run dev -- --open
```

Building: uses [@sveltejs/adapter-vercel](https://kit.svelte.dev/docs/adapter-vercel)

```bash
npm run build
```

...then run preview

```bash
npm run preview -- --open
```

### Notice

For [HTTPS support](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts/features_restricted_to_secure_contexts) when using the --host flag on localhost, install [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl).
You will receive a warning on first load, accept it to access the site.
