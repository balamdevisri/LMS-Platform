/**
 * Kaizen-Q AI LMS - Google Sheets Certificate Automation Web App
 * Google Apps Script (Code.gs)
 *
 * Configures a Web App endpoint serving as the centralized certificate registry database.
 */

// CONFIGURATION: Replace with your Google Spreadsheet ID (or keep blank to use bound sheet)
var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
var SHEET_NAME = "Certificates";

/**
 * Access the target Spreadsheet and Sheet
 */
function getSheet() {
  var ss;
  if (SPREADSHEET_ID && SPREADSHEET_ID !== "YOUR_SPREADSHEET_ID_HERE") {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // If the sheet doesn't exist, fallback to the first active sheet
    sheet = ss.getSheets()[0];
  }
  return sheet;
}

/**
 * Helper to serialize spreadsheet cells to JSON matching the backend's expected structure
 */
function mapRowToObj(row) {
  return {
    certificateId: row[0] || "",
    studentId: row[1] || "",
    studentName: row[2] || "",
    studentEmail: row[3] || "",
    courseId: row[4] || "",
    courseName: row[5] || "",
    completionDate: row[6] || "",
    issueDate: row[7] || "",
    certificateStatus: row[8] || "Issued",
    emailStatus: row[9] || "Sent",
    generatedTimestamp: row[10] || ""
  };
}

/**
 * Helper to return a CORS-friendly JSON TextOutput response
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 1. HTTP GET handler supporting:
 *    - action=get
 *    - action=check
 *    - action=list
 */
function doGet(e) {
  try {
    var params = e.parameter;
    var action = params.action;

    if (!action) {
      return jsonResponse({ success: false, error: "Missing parameter: action" });
    }

    if (action === "get") {
      return handleGet(params.certificateId);
    } else if (action === "check") {
      return handleCheck(params.studentEmail, params.courseId);
    } else if (action === "list") {
      return handleList(params.studentEmail);
    } else {
      return jsonResponse({ success: false, error: "Invalid GET action: " + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * 2. HTTP POST handler supporting:
 *    - action=append
 *    - action=get
 *    - action=check
 *    - action=list
 */
function doPost(e) {
  try {
    var body = {};
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    var action = body.action;

    if (!action) {
      return jsonResponse({ success: false, error: "Missing parameter: action" });
    }

    if (action === "append") {
      return handleAppend(body);
    } else if (action === "cleanup") {
      return handleCleanup(body.studentEmail, body.courseId);
    } else if (action === "get") {
      return handleGet(body.certificateId);
    } else if (action === "check") {
      return handleCheck(body.studentEmail, body.courseId);
    } else if (action === "list") {
      return handleList(body.studentEmail);
    } else {
      return jsonResponse({ success: false, error: "Invalid POST action: " + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Action: GET (Find single certificate by ID)
 */
function handleGet(certificateId) {
  if (!certificateId) {
    return jsonResponse({ success: false, error: "Missing parameter: certificateId" });
  }

  var sheet = getSheet();
  var data = sheet.getDataRange().getDisplayValues(); // Get values as displayed formatting strings

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[0]).trim() === String(certificateId).trim()) {
      return jsonResponse({ success: true, data: mapRowToObj(row) });
    }
  }

  return jsonResponse({ success: false, error: "Certificate not found." });
}

/**
 * Action: CHECK (Validate if a certificate is already recorded for a student & course)
 */
function handleCheck(studentEmail, courseId) {
  if (!studentEmail || !courseId) {
    return jsonResponse({ success: false, error: "Missing studentEmail or courseId" });
  }

  var sheet = getSheet();
  var data = sheet.getDataRange().getDisplayValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (
      String(row[3]).trim().toLowerCase() === String(studentEmail).trim().toLowerCase() &&
      String(row[4]).trim() === String(courseId).trim()
    ) {
      return jsonResponse({ success: true, data: mapRowToObj(row) });
    }
  }

  return jsonResponse({ success: false, data: null });
}

/**
 * Action: LIST (Get all certificates generated for a given student email)
 */
function handleList(studentEmail) {
  if (!studentEmail) {
    return jsonResponse({ success: false, error: "Missing parameter: studentEmail" });
  }

  var sheet = getSheet();
  var data = sheet.getDataRange().getDisplayValues();
  var list = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[3]).trim().toLowerCase() === String(studentEmail).trim().toLowerCase()) {
      list.push(mapRowToObj(row));
    }
  }

  return jsonResponse({ success: true, data: list });
}

/**
 * Action: APPEND (Inserts a new certificate log row into sheet, or updates if it already exists)
 */
function handleAppend(body) {
  var studentId = body.studentId;
  var courseId = body.courseId;
  
  if (!studentId || !courseId) {
    return jsonResponse({ success: false, error: "Missing required studentId or courseId" });
  }

  var sheet = getSheet();
  var data = sheet.getDataRange().getDisplayValues();
  
  var existingRowIndex = -1;
  var stableCertId = body.certificateId;

  // Uniqueness check: Match on studentId + courseId
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (
      String(row[1]).trim() === String(studentId).trim() &&
      String(row[4]).trim() === String(courseId).trim()
    ) {
      existingRowIndex = i;
      stableCertId = row[0] || body.certificateId; // Keep existing certificate ID stable
      break;
    }
  }

  var newRow = [
    stableCertId || "",
    body.studentId || "",
    body.studentName || "",
    body.studentEmail || "",
    body.courseId || "",
    body.courseName || "",
    body.completionDate || "",
    body.issueDate || "",
    body.certificateStatus || "Issued",
    body.emailStatus || "Sent",
    body.generatedTimestamp || new Date().toISOString()
  ];

  if (existingRowIndex !== -1) {
    // Update existing row (index i corresponds to i+1 row in Sheet)
    var rowNum = existingRowIndex + 1;
    sheet.getRange(rowNum, 1, 1, 11).setValues([newRow]);
    return jsonResponse({ success: true, updated: true, certificateId: stableCertId });
  } else {
    // Append new row
    sheet.appendRow(newRow);
    return jsonResponse({ success: true, updated: false, certificateId: stableCertId });
  }
}

/**
 * Action: CLEANUP (Removes wrong/test/duplicate rows matching a specific student email and courseId)
 */
function handleCleanup(studentEmail, courseId) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var rowsDeleted = 0;

  // Iterate backwards to safely delete rows without changing indices of remaining rows
  for (var i = data.length - 1; i >= 1; i--) {
    var row = data[i];
    var rowCertId = String(row[0]).trim();
    var rowStudentId = String(row[1]).trim();
    var rowStudentName = String(row[2]).trim();
    var rowEmail = String(row[3]).trim().toLowerCase();

    // Identify wrong/test/duplicate records
    var isTestRecord = false;
    
    if (
      rowStudentName.toLowerCase().indexOf("student user") !== -1 ||
      rowStudentName.toLowerCase().indexOf("default_student") !== -1 ||
      rowStudentName.toLowerCase().indexOf("test verification") !== -1 ||
      rowStudentName.toLowerCase().indexOf("banu prakash") !== -1 ||
      rowEmail.indexOf("test") !== -1 ||
      rowEmail === "verifytest@shaivika.ai" ||
      rowCertId.indexOf("TEST-123") !== -1 ||
      rowCertId.indexOf("TEST-VERIFY-999") !== -1 ||
      rowStudentId.indexOf("STU-ATTKFO") !== -1
    ) {
      isTestRecord = true;
    }

    if (isTestRecord) {
      sheet.deleteRow(i + 1); // 1-based index in Google Sheets
      rowsDeleted++;
    }
  }

  return jsonResponse({ success: true, rowsDeleted: rowsDeleted });
}
