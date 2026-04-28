- Scaffolded rontend/ manually because 
pm create vite@latest frontend -- --template react-ts cancelled when the pre-existing directory contained placeholder folders.
- Used Vite + React 19 + TypeScript with Tailwind CSS v3-style config files (	ailwind.config.js, postcss.config.js) plus an @/* alias in both ite.config.ts and 	sconfig.app.json.
- Verified 
pm run build succeeds and curl.exe http://localhost:5173 returns HTML containing the root div for the frontend entrypoint.

