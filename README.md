# Adam & Elsa — Wedding Invitation

Single-page wedding invitation. 24 October 2026 · Golden Boutique Hotel, Jakarta.
Akad 12.30 WIB · Resepsi 16.00 WIB.

Plain HTML/CSS/JS, no build step. See [PLAN.md](PLAN.md) for design decisions.

The opening screen is a low-poly 3D model of the Golden Boutique Hotel ([gate3d.js](gate3d.js), Three.js loaded from jsDelivr). The opening text (names, guest, "Buka Undangan") sits at the top of the screen with the hotel below it.

- **Arrival:** the camera eases in from the left at eye level and keeps strolling slowly toward the hotel. It sways with the mouse (desktop) or the phone's tilt (gyro; iOS asks for permission on the first tap).
- **The walk:** tapping "Buka Undangan" walks the camera, unhurried, around the fountain and up the red carpet. On the way, QS. Az-Zariyat: 49 shows, then our story ("Perjalanan kami tidak singkat. …") rises line by line. As its last line, "Dan kami ingin merayakannya bersama kalian.", finishes, the hotel doors swing open and the invitation page fades in. A tap during the story skips ahead. The text timings (`AYAT_AT`, `AYAT_MS`, `STORY_MS`) are in [gate3d.js](gate3d.js); the walk is paced to reach the doors as the text ends.

The 3D scene is only the front door. The invitation page itself (the "2D site") is a reproduction of the NgantenStory invitation at [inv.nstory.id/adam-elsa](https://inv.nstory.id/adam-elsa/) (template-11): banner, verse, our story, the couple, Akad & Resepsi, countdown, RSVP, Amplop Digital (bank-transfer popup), gallery with lightbox, guestbook and the thank-you photo. On phones it is one column; on computers (1080px and wider) a fixed photo panel sits on the left and the invitation scrolls in a 500px column on the right, as in the original. Styles are in [invite.css](invite.css), photos and line-art in `assets/img/inv/`. If WebGL or the CDN isn't available, the plain gate still works. The spinning record button (music on/off) floats above everything.

**Fonts:** the original template uses three paid fonts (Batusa, Brighton Signature, Monday, all "All Rights Reserved"), so they are not in this repo. Free Google Fonts stand in for them: Urbanist, Allison and Quicksand. If you own licenses for the originals, add `@font-face` rules for them and put their names first in `--font-body`, `--font-sign` and `--font-round` at the top of `invite.css`.

## Run locally

Open `index.html` directly, or serve it (recommended, so relative fetches behave):

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/?to=Nama+Tamu` — the `to` query param personalizes the greeting on the cover screen (and prefills the RSVP name).

Add `simple` to skip the 3D opener and use the original template's 2D cover instead ("Dear, Nama Tamu — You Are Invited! … Open Invitation"), e.g. `?to=Nama+Tamu&simple` (or just `?simple`). Tapping the cover slides it up and starts the music.

The Claude Code preview (`.claude/launch.json`) serves on port 8811 with `Cache-Control: no-store`, so edits always show on reload.

## Before you launch — placeholders to fill in

- **Google Maps pin**: "Lihat Lokasi" opens the same pin as the original invitation (https://maps.app.goo.gl/CVXyH9ZxdrndSdp88, Golden Boutique Hotel Kemayoran).
- **Background music**: "Tenderness in the Air" from Final Fantasy V, a classical guitar solo (the same recording as the original NgantenStory invitation), in `assets/audio/backsound.mp3` for every device. It was re-encoded from the invitation's file to 128 kbps MP3 with a short fade in/out for smooth looping: `ffmpeg -i in.mp3 -vn -map_metadata -1 -af "afade=t=in:d=1.5,afade=t=out:st=<duration-3>:d=3" -c:a libmp3lame -b:a 128k out.mp3`.
- **Opening quote**: QS. Az-Zariyat: 49 (Indonesian translation), in the `.inv-verse` section of `index.html`; the 3D walk shows it with the Arabic too.

## Wiring up RSVP + Guestbook (Google Sheet)

The RSVP form (name, attendance, number of guests) and the guestbook form (name, message) work right now in **preview mode** (nothing is saved; a guestbook message just shows on the page). To save them to a Google Sheet:

1. Upload [gas/rsvp-sheet.xlsx](gas/rsvp-sheet.xlsx) to Google Drive and open it as a Google Sheet. It has three tabs:
   - **RSVP**: header row only (Timestamp | Name | Attendance | Guests | Message). The website appends here.
   - **Ringkasan**: live totals (replies, hadir, tidak hadir, total guests attending, wishes).
   - **Petunjuk**: these setup steps.
2. File > Settings > Time zone: Jakarta (GMT+7).
3. Extensions > Apps Script: paste [gas/rsvp-endpoint.gs](gas/rsvp-endpoint.gs), then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
4. Copy the deployment's `/exec` URL and set `RSVP_ENDPOINT_URL` near the top of [script.js](script.js).
5. Reload the site. RSVPs and guestbook messages append to the RSVP tab (a guestbook row has a message but no attendance or guest count), and existing wishes load into the guestbook, newest first, with "x hours ago" times.

If you deployed the Apps Script before October 2026, paste the new [gas/rsvp-endpoint.gs](gas/rsvp-endpoint.gs) and re-deploy (Deploy > Manage deployments > edit > new version), and change **Ringkasan!B3** to `=COUNTIF(RSVP!C2:C5000,"Hadir")+COUNTIF(RSVP!C2:C5000,"Tidak Hadir")` so guestbook messages don't count as RSVP replies.

Don't type rows into the RSVP tab by hand: every row with a message is served publicly to the guestbook.

## Deploying

A GitHub Actions workflow (`.github/workflows/deploy.yml`) is included — it deploys to GitHub Pages on every push to `main`. To turn it on:

1. Push this repo to GitHub (if not already).
2. In the repo, go to **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` — the site will publish automatically. GitHub Pages' free tier comfortably handles far more than 300 views.

If you'd rather self-host on Hostinger instead, just upload the whole project folder (everything except `.github/` and `gas/`, which are dev-only) to your hosting root — it's plain static files, no server requirements.
