# Windows desktop development

The desktop client reuses the React/Vite workspace and calls the ASP.NET API. PostgreSQL remains behind the API and is never bundled in the desktop installer.

## Folder ownership

- `desktop/electron/` contains the Electron main process and local asset protocol.
- `desktop/scripts/` contains the development launcher.
- `src/` remains the shared React renderer for browser and desktop.
- `release/` contains generated installers and is ignored by Git.

## Commands

```powershell
npm install
npm run desktop:prepare
npm run desktop:dev
npm run lint
npm run build
npm run desktop:build:dir
npm run desktop:build
```

`desktop:build:dir` prepares an unpacked Windows x64 app for local inspection. `desktop:build` creates a per-user NSIS installer. Production builds must set `VITE_API_BASE_URL` to the deployed HTTPS API before building, and the API must allow the `dogwalking://app` origin in CORS.

The current development API defaults to `http://localhost:5199/api`. Keep that HTTP endpoint local to development; deployed builds must use HTTPS.
