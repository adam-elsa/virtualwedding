# Adam & Elsa — Wedding Invitation

Single-page wedding invitation. 24 October 2026 · Golden Boutique Hotel, Jakarta.
Akad 12.30 WIB · Resepsi 16.00 WIB.

Plain HTML/CSS/JS, no build step. See [PLAN.md](PLAN.md) for design decisions.

The opening screen is a low-poly 3D model of the Golden Boutique Hotel ([gate3d.js](gate3d.js), Three.js loaded from jsDelivr). The opening text (names, guest, "Buka Undangan") sits at the top of the screen with the hotel below it.

- **Arrival:** the camera eases in from the left at eye level and keeps strolling slowly toward the hotel. It sways with the mouse (desktop) or the phone's tilt (gyro; iOS asks for permission on the first tap).
- **The walk:** tapping "Buka Undangan" walks the camera, unhurried, around the fountain and up the red carpet. On the way, QS. Az-Zariyat: 49 shows, then our story ("Perjalanan kami tidak singkat. …") rises line by line. As its last line, "Dan kami ingin merayakannya bersama kalian.", finishes, the hotel doors swing open and the invitation page fades in. A tap during the story skips ahead. The text timings (`AYAT_AT`, `AYAT_MS`, `STORY_MS`) are in [gate3d.js](gate3d.js); the walk is paced to reach the doors as the text ends.

The 3D scene is only the front door: the invitation itself is the plain page, with the couple, story, schedule, RSVP, gift details and guestbook. If WebGL or the CDN isn't available, the plain gate still works. The ♪ music button floats above the 3D scene.

## Run locally

Open `index.html` directly, or serve it (recommended, so relative fetches behave):

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/?to=Nama+Tamu` — the `to` query param personalizes the greeting on the cover screen (and prefills the RSVP name).

The Claude Code preview (`.claude/launch.json`) serves on port 8811 with `Cache-Control: no-store`, so edits always show on reload.

## Before you launch — placeholders to fill in

- **Google Maps pin** — the "Lihat Lokasi" buttons currently link to a text search for "Golden Boutique Hotel Jakarta". Swap in your exact Google Maps share link if you have a preferred pin (in `index.html`, the two `href="https://www.google.com/maps/..."` links).
- **Background music**: "I Really Want to Stay at Your House". Phones and tablets get the guitar version (`assets/audio/backsound-guitar.mp3`), computers the orchestra version (`assets/audio/backsound-orchestra.mp3`). The orchestra file is the original, untouched. The guitar file was re-encoded from the original in `music/` (not committed) to 96 kbps MP3 with a short fade in/out for smooth looping: `ffmpeg -i in.mp3 -vn -map_metadata -1 -af "afade=t=in:d=1.5,afade=t=out:st=<duration-3>:d=3" -c:a libmp3lame -b:a 96k out.mp3`.
- **Opening quote** — currently QS. Az-Zariyat: 49 (Arabic + Indonesian translation), in the `.quote-section` of `index.html`. Swap for a different verse/quote if you'd like.

## Wiring up RSVP + Guestbook (Google Sheet)

The RSVP form is built and works right now in **preview mode** (submissions just render on-page, nothing is saved). To persist real submissions to a Google Sheet:

1. Upload [gas/rsvp-sheet.xlsx](gas/rsvp-sheet.xlsx) to Google Drive and open it as a Google Sheet. It has three tabs:
   - **RSVP**: header row only (Timestamp | Name | Attendance | Guests | Message). The website appends here.
   - **Ringkasan**: live totals (replies, hadir, tidak hadir, total guests attending, wishes).
   - **Petunjuk**: these setup steps.
2. File > Settings > Time zone: Jakarta (GMT+7).
3. Extensions > Apps Script: paste [gas/rsvp-endpoint.gs](gas/rsvp-endpoint.gs), then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
4. Copy the deployment's `/exec` URL and set `RSVP_ENDPOINT_URL` near the top of [script.js](script.js).
5. Reload the site. RSVPs append to the RSVP tab, and existing wishes load into the guestbook.

Don't type rows into the RSVP tab by hand: every row with a message is served publicly to the guestbook.

## Deploying

A GitHub Actions workflow (`.github/workflows/deploy.yml`) is included — it deploys to GitHub Pages on every push to `main`. To turn it on:

1. Push this repo to GitHub (if not already).
2. In the repo, go to **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` — the site will publish automatically. GitHub Pages' free tier comfortably handles far more than 300 views.

If you'd rather self-host on Hostinger instead, just upload the whole project folder (everything except `.github/` and `gas/`, which are dev-only) to your hosting root — it's plain static files, no server requirements.
