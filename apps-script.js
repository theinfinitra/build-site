// ============================================================
// Infinitra Build — Google Apps Script
// ============================================================
// 
// SETUP INSTRUCTIONS:
// 1. Create a Google Sheet (name it "Infinitra Build Applications")
// 2. Create two tabs: "Applications" and "Waitlist"
// 3. In "Applications" tab, add headers in Row 1:
//    Timestamp | Name | Phone | Email | Location | Current Situation | Why Build | Hard Thing | Source
// 4. In "Waitlist" tab, add headers in Row 1:
//    Timestamp | Email
// 5. Go to Extensions → Apps Script
// 6. Delete the default code and paste this entire file
// 7. UPDATE THE SHEET_ID below with your Google Sheet ID
//    (found in the sheet URL: docs.google.com/spreadsheets/d/SHEET_ID/edit)
// 8. Click Deploy → New Deployment
// 9. Select "Web app"
// 10. Set "Execute as" → "Me"
// 11. Set "Who has access" → "Anyone"
// 12. Click Deploy → Copy the URL
// 13. Paste the URL into config.js (both formEndpoint and waitlistEndpoint)
//
// TESTING:
// After deploying, you can test with:
// curl -L -X POST YOUR_URL -H "Content-Type: application/json" -d '{"type":"application","name":"Test","phone":"9999999999","email":"test@test.com","location":"Kurnool","situation":"Student","whyBuild":"Testing the form","hardThing":"Testing","source":"Other"}'
//
// ============================================================

// UPDATE THIS with your Google Sheet ID
const SHEET_ID = "1P3fYwRK79UlzI5729TJCK1eL3Ypi7w0rIn7gkEshwcQ";

function getSpreadsheet() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = getSpreadsheet();
    
    if (data.type === "waitlist") {
      return handleWaitlist(ss, data);
    } else if (data.type === "challenge") {
      return handleChallenge(ss, data);
    } else {
      return handleApplication(ss, data);
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleApplication(ss, data) {
  const sheet = ss.getSheetByName("Applications");
  
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: "Applications sheet not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Check for duplicates by phone or email
  const existingData = sheet.getDataRange().getValues();
  for (var i = 1; i < existingData.length; i++) {
    var rowPhone = String(existingData[i][2]).trim();
    var rowEmail = String(existingData[i][3]).trim().toLowerCase();
    if (
      (data.phone && rowPhone === String(data.phone).trim()) ||
      (data.email && rowEmail === String(data.email).trim().toLowerCase())
    ) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "duplicate", message: "Application already exists" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  
  sheet.appendRow([
    timestamp,
    data.name || "",
    data.phone || "",
    data.email || "",
    data.location || "",
    data.situation || "",
    data.whyBuild || "",
    data.hardThing || "",
    data.source || ""
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: "success", message: "Application received" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleWaitlist(ss, data) {
  const sheet = ss.getSheetByName("Waitlist");
  
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: "Waitlist sheet not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  
  sheet.appendRow([
    timestamp,
    data.email || ""
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: "success", message: "Added to waitlist" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleChallenge(ss, data) {
  var sheet = ss.getSheetByName("Challenges");
  
  if (!sheet) {
    // Create the sheet if it doesn't exist
    sheet = ss.insertSheet("Challenges");
    sheet.appendRow(["Timestamp", "Email", "Questions", "Time (min)", "Research", "Problem", "Judgment", "Apply (AI Usage)"]);
  }
  
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  
  sheet.appendRow([
    timestamp,
    data.email || "",
    data.questions || "",
    data.timeTaken || "",
    data.research || "",
    data.problem || "",
    data.judgment || "",
    data.apply || ""
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({ status: "success", message: "Challenge saved" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle GET requests (for testing in browser)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Infinitra Build form endpoint is live." }))
    .setMimeType(ContentService.MimeType.JSON);
}
