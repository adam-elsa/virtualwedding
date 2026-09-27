// Google Apps Script Web App — RSVP + Guestbook endpoint for the Adam & Elsa wedding site.
//
// SETUP (one-time, from your own Google account):
// 1. Upload gas/rsvp-sheet.xlsx to Google Drive and open it as a Google Sheet. It already has the
//    "RSVP" tab (header: Timestamp | Name | Attendance | Guests | Message), a "Ringkasan" summary
//    and a "Petunjuk" tab with these steps. Set File > Settings > Time zone to Jakarta (GMT+7).
// 2. In the Sheet, go to Extensions > Apps Script. Delete any starter code and paste this whole file.
// 3. Click Deploy > New deployment > select type "Web app".
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the deployment URL (ends in /exec) and paste it into RSVP_ENDPOINT_URL in script.js.
// 5. Re-deploy (Deploy > Manage deployments > edit > new version) any time you change this file.

const SHEET_NAME = 'RSVP';

// Stop guest input like "=HYPERLINK(...)" from being run as a Sheet formula.
function safeCell(value) {
  const s = String(value == null ? '' : value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    safeCell(data.name),
    safeCell(data.attendance),
    Math.max(1, Math.min(10, parseInt(data.guests, 10) || 1)), // a real number, so the summary can add it up
    safeCell(data.message),
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const [, ...body] = rows; // skip header row

  // Public endpoint: only return what the guestbook shows — never attendance or guest counts.
  const wishes = body
    .filter((row) => row[4])
    .map((row) => ({
      name: row[1],
      message: row[4],
    }));

  return ContentService
    .createTextOutput(JSON.stringify(wishes))
    .setMimeType(ContentService.MimeType.JSON);
}
