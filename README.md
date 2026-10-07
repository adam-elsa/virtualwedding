# Adam & Elsa — Wedding Invitation

Single-page wedding invitation. 24 October 2026 · Golden Boutique Hotel, Jakarta.
Akad 12.30 WIB · Resepsi 16.00 WIB.

Plain HTML/CSS/JS, no build step. See [PLAN.md](PLAN.md) for design decisions.

**Live site:** https://adam-elsa.github.io/virtualwedding/ (GitHub Pages, deployed from `main` by [.github/workflows/deploy.yml](.github/workflows/deploy.yml))

- With a guest's name: https://adam-elsa.github.io/virtualwedding/?to=Nama+Tamu
- Without the 3D opener (2D cover instead): https://adam-elsa.github.io/virtualwedding/?to=Nama+Tamu&simple
- Straight into the ballroom: https://adam-elsa.github.io/virtualwedding/?to=Nama+Tamu&ballroom

This repository is the **virtual event**. The invitation for the live event lives separately at
[adamvirtualspace-lab/adamelsaweddingsite](https://adamvirtualspace-lab.github.io/adamelsaweddingsite/).

The opening screen is a low-poly 3D model of the Golden Boutique Hotel ([gate3d.js](gate3d.js), Three.js loaded from jsDelivr). The opening text (names, guest, "Buka Undangan") sits at the top of the screen with the hotel below it.

- **Arrival:** the camera eases in from the left at eye level and keeps strolling slowly toward the hotel. It sways with the mouse (desktop) or the phone's tilt (gyro; iOS asks for permission on the first tap).
- **The walk:** tapping "Buka Undangan" walks the camera, unhurried, around the fountain and up the red carpet, with QS. Az-Zariyat: 49 overlaid. The hotel doors swing open, the screen flares white and the camera steps through into the lobby.
- **The lobby** ([lobby3d.js](lobby3d.js)): a low-poly hotel lobby — slatted oak walls, a black-marble reception desk, lounge chairs, a draped gift table — with our photos hung on the walls. Our story ("Perjalanan kami tidak singkat. …") rises line by line over it; its last line, "Dan kami ingin merayakannya bersama kalian.", then glides across and shrinks into the RSVP button on the desk. A tap during the story skips ahead.
- **Looking around the lobby:** the camera sways with the mouse or the phone's tilt. Each photo group carries a floating label — **Kedua Mempelai**, **Lokasi & Tempat**, **Cerita Kami**, **Amplop Digital** and the **RSVP** button on the desk. Hovering a group (on phones, all of them at rest) shows its label; clicking one frames it and opens the matching card:
  - *Kedua Mempelai* — one continuous pan Adam → Elsa → together, the card changing with the camera (a tap skips to the end).
  - *Lokasi & Tempat* — the map board by the door, with an embedded Google map (loaded only when opened) and the Akad/Resepsi times.
  - *Cerita Kami* — steps back to see the photo corner; tapping a photo zooms into it.
  - *Amplop Digital* — the gift box on its draped table, with the BCA number and a copy button.
  - *RSVP* (the button on the reception desk) — faces the door with the confirmation form over it; it posts to the same places as the invitation's own form, and prefills the guest name from `?to=`.
- **Into the ballroom:** the door at the left of the lobby's front wall carries a **Masuk Ballroom** button. Clicking it (or the door, or the photo beside it) walks up to the door; its two leaves swing open and the camera steps through.
- **The ballroom** ([ballroom3d.js](ballroom3d.js)): the Golden Ballroom, dressed the way it is planned for the day. The room itself (navy carpet with a gold trellis, cream walls with gilt frames, tray ceiling with chandeliers) follows photos of the real ballroom; the layout follows our floor-plan sketch and the decoration follows Dazzling Dekorasi's technical-meeting brief:
  - *Pelaminan* — 7 m backdrop of ivory panels with wavy tops in front of an 8 m black curtain with fairy lights, white-to-blush flower cascades, our names on the centre panel, one set of sofas, standing flowers, light grey stage carpet and a mini garden in front.
  - *The aisle* — white petal carpet from the entrance door, round the corner and up to the stage, past four standing flowers, through the 3 x 3 m flower gazebo and under two pairs of crescent flower gates ("gate sabit") with crystal lamps. Dusty pink with a little navy and white.
  - *Around it* — the VIP area (roped off, three tables), the band corner with its own backdrop, three food stalls, two drinks tables, rows of chairs and round guest tables between the pillars.
- **Getting around the ballroom:** the guest walks in from the entrance door and stops at the foot of the aisle. Dragging turns the view (the mouse or the phone's tilt sways it too). Tapping a label, the thing itself, or a dot on the little floor plan in the corner walks there, along paths that never cut through the furniture. "← Lobi" (the button, or the label on the entrance door) goes back to the lobby; "Lanjut ke Undangan" leaves for the invitation page.
- **Leaving:** "Lanjut ke Undangan" at the bottom hands over to the invitation page below. "← Kembali" returns from any card to looking around.

The timings (`STORY_AT`, `STORY_MS`, `ARRIVE_MS`) are in [gate3d.js](gate3d.js); the lobby's room layout, photo positions and camera framing are at the top of [lobby3d.js](lobby3d.js). The ballroom's floor plan (where the stage, gazebo, gates, tables and stalls stand), its flower colours (`PAL`) and the spots the guest can walk to (`SPOTS`, with their labels and captions) are at the top of [ballroom3d.js](ballroom3d.js).

The 3D scene is the front door, the lobby and the ballroom. The invitation page itself (the "2D site") is a reproduction of the NgantenStory invitation at [inv.nstory.id/adam-elsa](https://inv.nstory.id/adam-elsa/) (template-11): banner, verse, our story, the couple, Akad & Resepsi, countdown, RSVP, Amplop Digital (bank-transfer popup), gallery with lightbox, guestbook and the thank-you photo. On phones it is one column, as in the original. On computers it stays full-screen: full-width sections and photos (landscape versions of the same shots where we have them: the original `01_Banner.jpg` hero, `05_TimingAkadResepsi.jpg`, …) with the content centred, instead of the original's fixed photo panel and 500px column. Styles are in [invite.css](invite.css), photos and line-art in `assets/img/inv/`. If WebGL or the CDN isn't available, the plain gate still works. The spinning record button (music on/off) floats above everything.

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
- **Opening quote**: QS. Az-Zariyat: 49 (Indonesian translation), in the `.inv-verse` section of `index.html` and in the 3D walk (`.gate-ayat`).

## RSVP + guestbook → our NgantenStory invitation

RSVPs that reach the invitation's form also land in the Google Sheet NgantenStory keeps for it, since that's where its RSVP form is wired.

Every RSVP made on this site is also sent to the RSVP form on our NgantenStory invitation (inv.nstory.id/adam-elsa, Fluent Forms form 705), the same way that page's own form sends it: name, "Saya akan hadir" / "Maaf tidak hadir", and "Jumlah Tamu" (only for guests who are coming). This site lets guests pick 1–6, but the invitation's form only offers 1 or 2, so for 3–6 it sends 2 and adds the real number to the name, e.g. "Budi Santoso (5 tamu)", so the entry isn't turned down and the count isn't lost. So all RSVPs show up together in the NgantenStory entries list. The settings (`NSTORY_AJAX_URL`, `NSTORY_FORM_ID`, `NSTORY_POST_ID`) are at the top of [script.js](script.js); set `NSTORY_AJAX_URL` to `''` to stop.

The browser sends it cross-site, so it can't read NgantenStory's reply. The guest always sees "Terima kasih", even if NgantenStory rejected the entry (for example if nonce checking or spam protection is switched on for the form). After going live, send one test RSVP and check it appears in the NgantenStory dashboard. Guestbook messages go there too: each one is posted to the invitation's guestbook (CommentPress, i.e. WordPress comments on the adam-elsa page, via `wp-comments-post.php`), so it shows publicly alongside the messages left on the invitation itself. `NSTORY_COMMENTS_URL` at the top of script.js turns this off. Same caveat: the reply can't be read, so leave one test message after going live and check it appears on inv.nstory.id/adam-elsa (WordPress may hold some comments for approval, e.g. ones with several links). This site's guestbook shows the invitation's messages live: it reads them from WordPress's public comments API on inv.nstory.id (which allows this site to read it) when the page opens and every minute after, newest first, so both guestbooks show the same messages. A guest's own message shows straight away and is replaced by the invitation's copy once it appears there (if it never does, it was held for approval or turned down). `NSTORY_WISHES_URL` at the top of script.js turns this off; the Google Sheet copy is then used instead, if set up.

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
