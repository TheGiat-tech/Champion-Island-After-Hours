# After Hours Island

A Phaser 3 browser adventure inspired by a calm, after-work island awakening. Playable as static files with no build tools or installs required.

## Running locally

Serve the files from the project root so the browser can load modules and JSON:

1) Python

```bash
python3 -m http.server 8000
```
Visit http://localhost:8000.

2) `npx serve`

```bash
npx serve -l 8000
```
Visit http://localhost:8000.

> Some mobile browsers (notably iPhone document viewers) block module or CDN loading. If the game does not start, open it in Safari/Chrome via a local server instead of file viewers.

## Deploying to GitHub Pages

1. Push the repository to GitHub.
2. In the repository settings, enable GitHub Pages for the `main` branch (root folder).
3. Wait for the site to build, then open the provided Pages URL.

## Controls

- Desktop: WASD or arrow keys to move, `E` to interact, `Space` to confirm/advance.
- Mobile: On-screen D-pad plus Interact and Confirm buttons.

## Customizing assets

All asset paths live in `data/assets.json`. Update the manifest to point to your own atlas, spritesheets, or single images. If files are missing or empty, the game automatically swaps to placeholder shapes so it remains fully playable.
