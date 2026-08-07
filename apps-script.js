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

// Confirmation email settings
// Requires: Add this email as a "Send mail as" alias in your Gmail settings
const FROM_EMAIL = "build@theinfinitra.com";
const FROM_NAME = "Infinitra Build";

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
  
  // Send confirmation email
  sendConfirmationEmail(data.email, data.name);
  
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

// Handle GET requests
// - No params: health check
// - ?check=challenge&email=x@y.com: check if candidate already submitted challenge
function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};

  // If no check param, return health status
  if (!params.check) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok", message: "Infinitra Build form endpoint is live." }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Challenge completion check
  if (params.check === "challenge" && params.email) {
    var email = String(params.email).trim().toLowerCase();
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Challenges");

    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ completed: false }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    // Email is in column B (index 1)
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]).trim().toLowerCase() === email) {
        return ContentService
          .createTextOutput(JSON.stringify({ completed: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ completed: false }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Unknown check type
  return ContentService
    .createTextOutput(JSON.stringify({ status: "error", message: "Unknown check type" }))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// Confirmation Email
// ============================================================

function sendConfirmationEmail(email, name) {
  if (!email) return;
  
  var firstName = (name || "").split(" ")[0] || "there";
  
  var subject = "Got your application — Infinitra Build";
  
  var body = "Hi " + firstName + ",\n\n"
    + "We received your application for Infinitra Build (September 2026).\n\n"
    + "Next step: Complete the online challenge.\n"
    + "Go to build.theinfinitra.com/challenge and use the same email you applied with.\n"
    + "It takes about 20 minutes. Any tool allowed (Google, AI, anything).\n\n"
    + "What happens after:\n"
    + "- We review applications weekly\n"
    + "- Shortlisted candidates are invited to a half-day selection at our Kurnool studio\n"
    + "- You'll hear from us within 10 days\n\n"
    + "No need to reply to this email.\n\n"
    + "— Infinitra Build Team\n"
    + "build.theinfinitra.com";
  
  try {
    GmailApp.sendEmail(email, subject, body, {
      from: FROM_EMAIL,
      name: FROM_NAME
    });
  } catch (e) {
    // Log but don't fail the application if email fails
    console.log("Email send failed for " + email + ": " + e.message);
  }
}

// ============================================================
// Auto-Rejection Emails (Challenge Stage)
// ============================================================
// Set up a daily time-based trigger for this function:
// 1. In Apps Script editor, go to Triggers (clock icon, left sidebar)
// 2. Click "+ Add Trigger"
// 3. Function: sendChallengeRejections
// 4. Event source: Time-driven
// 5. Type: Day timer → 9am-10am (or your preferred time)
// 6. Save
//
// This finds REJECT rows in the Challenges tab that haven't been
// emailed yet, sends a kind rejection, and marks them as notified.

function sendChallengeRejections() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName("Challenges");
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var header = data[0];

  // Find the Composite and Notified columns
  var compositeCol = header.indexOf("Composite");
  var notifiedCol = header.indexOf("Notified");

  if (compositeCol === -1) return; // Scorer hasn't run yet

  // Add Notified column if it doesn't exist
  if (notifiedCol === -1) {
    notifiedCol = header.length;
    sheet.getRange(1, notifiedCol + 1).setValue("Notified");
  }

  var sent = 0;

  for (var i = 1; i < data.length; i++) {
    var composite = data[i][compositeCol];
    var notified = data[i][notifiedCol] || "";
    var email = data[i][1]; // Email is column B

    if (composite === "REJECT" && notified !== "YES" && email) {
      // Look up name from Applications tab
      var name = getApplicantName(ss, email);
      var firstName = (name || "").split(" ")[0] || "there";

      var subject = "Infinitra Build — Application Update";
      var body = "Hi " + firstName + ",\n\n"
        + "Thank you for taking the time to apply to Infinitra Build and completing the challenge.\n\n"
        + "We reviewed your responses carefully. This time, we're not able to move forward with your application. "
        + "This doesn't reflect your potential — our challenge tests a narrow set of signals, and a single attempt doesn't define what you're capable of.\n\n"
        + "You're welcome to apply again for the next cohort. Many strong builders need more than one attempt.\n\n"
        + "Keep building.\n\n"
        + "— Infinitra Build Team\n"
        + "build.theinfinitra.com";

      try {
        GmailApp.sendEmail(email, subject, body, {
          from: FROM_EMAIL,
          name: FROM_NAME
        });
        sheet.getRange(i + 1, notifiedCol + 1).setValue("YES");
        sent++;
      } catch (e) {
        console.log("Rejection email failed for " + email + ": " + e.message);
      }

      // Throttle to avoid hitting Gmail rate limits
      if (sent >= 20) break; // Max 20 per run, picks up the rest next day
    }
  }

  console.log("Sent " + sent + " rejection emails.");
}

function getApplicantName(ss, email) {
  var appSheet = ss.getSheetByName("Applications");
  if (!appSheet) return "";

  var data = appSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][3]).trim().toLowerCase() === email.trim().toLowerCase()) {
      return data[i][1]; // Name is column B in Applications
    }
  }
  return "";
}

// ============================================================
// Auto-Invite Emails (Challenge Stage — AUTO_INVITE)
// ============================================================
// Set up a daily time-based trigger for this function:
// 1. In Apps Script editor, go to Triggers (clock icon, left sidebar)
// 2. Click "+ Add Trigger"
// 3. Function: sendChallengeInvites
// 4. Event source: Time-driven
// 5. Type: Day timer → 9am-10am (same as rejections is fine)
// 6. Save
//
// Sends a "you're shortlisted" email to AUTO_INVITE candidates.
// Selection day date is communicated separately once groups are batched.

function sendChallengeInvites() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName("Challenges");
  if (!sheet) return;

  var data = sheet.getDataRange().getValues();
  var header = data[0];

  var compositeCol = header.indexOf("Composite");
  var notifiedCol = header.indexOf("Notified");

  if (compositeCol === -1) return;

  if (notifiedCol === -1) {
    notifiedCol = header.length;
    sheet.getRange(1, notifiedCol + 1).setValue("Notified");
  }

  var sent = 0;

  for (var i = 1; i < data.length; i++) {
    var composite = data[i][compositeCol];
    var notified = data[i][notifiedCol] || "";
    var email = data[i][1];

    if (composite === "AUTO_INVITE" && notified !== "YES" && email) {
      var name = getApplicantName(ss, email);
      var firstName = (name || "").split(" ")[0] || "there";

      var subject = "Infinitra Build — You're shortlisted!";
      var body = "Hi " + firstName + ",\n\n"
        + "You did well on the challenge. We'd like to invite you to a selection day at our studio in Kurnool.\n\n"
        + "What to expect:\n"
        + "- Half-day session (about 4.5 hours)\n"
        + "- 4 blocks: solo challenge, live work, peer exercise, 1:1 interview\n"
        + "- Any AI tool allowed throughout\n"
        + "- We're watching how you think, not what you know\n\n"
        + "What to bring:\n"
        + "- Laptop + charger (we have spares if needed)\n"
        + "- Your curiosity\n\n"
        + "What NOT to prepare:\n"
        + "- Nothing. Problems are given on the spot.\n\n"
        + "We'll share the specific date and time shortly. Please reply to confirm you're interested and available.\n\n"
        + "See you at the studio.\n\n"
        + "— Infinitra Build Team\n"
        + "Infinitra Studio, No. 154, Third Floor, Reddy Complex,\n"
        + "Venkata Ramana Colony Main Road, Kurnool, AP 518003\n"
        + "https://www.google.com/maps?q=15.835306,78.020222";

      try {
        GmailApp.sendEmail(email, subject, body, {
          from: FROM_EMAIL,
          name: FROM_NAME
        });
        sheet.getRange(i + 1, notifiedCol + 1).setValue("YES");
        sent++;
      } catch (e) {
        console.log("Invite email failed for " + email + ": " + e.message);
      }

      if (sent >= 20) break;
    }
  }

  console.log("Sent " + sent + " invite emails.");
}
