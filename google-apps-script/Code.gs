/**
 * LUMEO Digital Media - Google Sheets Lead Capture Webhook
 *
 * Setup:
 * 1. Open Google Sheets and create a new spreadsheet (e.g., "LUMEO Leads").
 * 2. Click Extensions -> Apps Script.
 * 3. Paste this entire file into Code.gs and save.
 * 4. Click Deploy -> New deployment -> Select type: Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Authorize the script when prompted and copy the Web App URL.
 * 6. Paste that Web App URL into GOOGLE_SHEET_WEB_APP_URL in js/script.js.
 */

const SHEET_NAME = 'Leads';

const HEADERS = [
  'Submitted At',
  'Full Name',
  'Company Name',
  'Work Email',
  'Mobile Number',
  'Selected Service',
  'Source Form',
  'Page',
  'Lead Status'
];

function getOrCreateLeadsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    // Rename the default first sheet if it's empty, otherwise insert a new sheet
    const firstSheet = ss.getSheets()[0];
    if (firstSheet && firstSheet.getLastRow() === 0) {
      firstSheet.setName(SHEET_NAME);
      sheet = firstSheet;
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange
      .setFontWeight('bold')
      .setBackground('#4C1D95')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('left');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }

  return sheet;
}

function parsePayload(e) {
  let data = {};

  if (e && e.postData && e.postData.contents) {
    const contentType = (e.postData.type || '').toLowerCase();
    if (contentType.indexOf('application/json') !== -1 || e.postData.contents.trim().startsWith('{')) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = {};
      }
    }
  }

  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(function (key) {
      if (data[key] === undefined || data[key] === '') {
        data[key] = e.parameter[key];
      }
    });
  }

  return data;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const data = parsePayload(e);
    const sheet = getOrCreateLeadsSheet();

    const submittedAt = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || 'Asia/Kolkata',
      'yyyy-MM-dd HH:mm:ss'
    );

    const fullPhone =
      data['Full Mobile Number'] ||
      [data['Country Code'] || '', data['Mobile Number'] || ''].join(' ').trim();

    const row = [
      submittedAt,
      data['Full Name'] || '',
      data['Company Name'] || '',
      data['Work Email'] || '',
      fullPhone,
      data['Selected Service'] || data['Requested Service'] || '',
      data['Source Form'] || 'Website Enquiry',
      data['Page'] || '',
      'New'
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', row: sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'LUMEO Leads Webhook' }))
    .setMimeType(ContentService.MimeType.JSON);
}

