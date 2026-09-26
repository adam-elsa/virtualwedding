# Adam & Elsa — Wedding Invitation

Single-page wedding invitation. 24 October 2026 · Golden Boutique Hotel, Jakarta.
Akad 13.00 WIB · Resepsi 16.00 WIB.

Plain HTML/CSS/JS, no build step. See [PLAN.md](PLAN.md) for design decisions.

The opening screen is a low-poly 3D model of the Golden Boutique Hotel ([gate3d.js](gate3d.js), Three.js loaded from jsDelivr). The camera eases in from the left at eye level, then sways with the mouse (desktop) or the phone's tilt (gyro; iOS asks for permission on the first tap). Tapping "Buka Undangan" walks the camera around the fountain and up the red carpet, with QS. Az-Zariyat: 49 overlaid on the way. The lobby doors swing open, and through a warm flash the guest lands in a low-poly hotel lobby ([lobby3d.js](lobby3d.js)) with photos framed on the walls in three clickable groups:

- **Kedua Mempelai**: a camera pan across Adam's portrait, Elsa's portrait, then the couple photo, lingering on each, with cards naming the groom, the bride and their parents.
- **Lokasi & Tempat**: the map board, plus a card with a Google map, the Akad/Resepsi times, and a "Buka Google Maps" button.
- **Cerita Kami**: the photos on the slatted column and the right wall. Clicking any of them zooms in; clicking the label shows all of them together.
- **RSVP**: hovering the reception desk, the door, or the photo beside the door lights all three and shows an RSVP button. It turns to face the door and opens an RSVP form over it, prefilled with the guest's name from `?to=`. It submits the same way as the invitation's RSVP form (see below).

"Lanjut ke Undangan" opens the invitation. If WebGL or the CDN isn't available, the plain gate still works.

- **Photos:** listed in `PHOTOS` at the top of [lobby3d.js](lobby3d.js) (file, group, wall position, size). To add more to "Cerita Kami", add entries with `group: 'story'` on the right wall (x = 9.84).
- **Card text** (names, parents, times) is in the `lobby-card` block of [index.html](index.html).

## Run locally

Open `index.html` directly, or serve it (recommended, so relative fetches behave):

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/?to=Nama+Tamu` — the `to` query param personalizes the greeting on the cover screen.

## Before you launch — placeholders to fill in

- **Bank account holder name** — in `index.html`, search for `[Nama Pemilik Rekening]`.
- **Google Maps pin** — the "Lihat Lokasi" buttons currently link to a text search for "Golden Boutique Hotel Jakarta". Swap in your exact Google Maps share link if you have a preferred pin (in `index.html`, the two `href="https://www.google.com/maps/..."` links).
- **Background music** — add an MP3 at `assets/audio/backsound.mp3` (any royalty-free track, or a song you two like — check licensing if it's commercial). The site works fine without it; the music button just won't play anything until the file exists.
- **Opening quote** — currently QS. Az-Zariyat: 49 (Arabic + Indonesian translation), in the `.quote-section` of `index.html`. Swap for a different verse/quote if you'd like.

## Wiring up RSVP + Guestbook (Google Sheet)

The RSVP form is built and works right now in **preview mode** (submissions just render on-page, nothing is saved). To persist real submissions to a Google Sheet:

1. Follow the setup steps at the top of [gas/rsvp-endpoint.gs](gas/rsvp-endpoint.gs) (create a Sheet, paste the script into Apps Script, deploy as a Web App).
2. Copy the deployment's `/exec` URL.
3. In [script.js](script.js), set `RSVP_ENDPOINT_URL` near the top to that URL.
4. Reload the site — new RSVPs will append to your Sheet, and existing wishes will load into the Guestbook section on page load.

## Deploying

A GitHub Actions workflow (`.github/workflows/deploy.yml`) is included — it deploys to GitHub Pages on every push to `main`. To turn it on:

1. Push this repo to GitHub (if not already).
2. In the repo, go to **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` — the site will publish automatically. GitHub Pages' free tier comfortably handles far more than 300 views.

If you'd rather self-host on Hostinger instead, just upload the whole project folder (everything except `.github/` and `gas/`, which are dev-only) to your hosting root — it's plain static files, no server requirements.
