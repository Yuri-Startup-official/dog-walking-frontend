# DogWalking web and desktop client

Shared React/Vite workspace for the public website and owner/sitter accounts. The first desktop release targets Windows and packages this UI in a secure Electron shell. Both clients use the ASP.NET API; the desktop installer does not contain a database or API secret.

## Project layout

```text
src/
  api/                  HTTP client and authentication state
  pages/                Sign-in and owner/sitter workspaces
  assets/               Bundled images
desktop/
  assets/               Shared SVG brand mark and Windows icon
  electron/             Windows desktop main process and app protocol
  scripts/              Desktop development launcher
docs/
  architecture/         Product architecture and screen map
  development/          Windows desktop build guide
public/                 Static web assets
```

Generated files are separated from source: `dist/` contains the Vite build and `release/windows/` contains unpacked apps and Windows installers; both are ignored by Git.

## Commands

```powershell
npm install
npm run desktop:prepare
npm run dev
npm run desktop:dev
npm run lint
npm run build
npm run desktop:build:dir
npm run desktop:build
```

For Windows desktop setup and API configuration, see [the desktop guide](docs/development/WINDOWS_DESKTOP.md). The current screen state is documented in [the screen map](docs/architecture/SCREEN_MAP.md); intended product boundaries are in [the architecture overview](docs/architecture/PRODUCT.md).

## Current scope

Sign-in, registration, pet profiles, order creation, applications, assignment, and service status changes are connected to the API. The map is still illustrative. Manager support chat, real map/geocoding, email verification, payments, and production hosting remain planned work; the screen map marks implemented and planned areas separately.
