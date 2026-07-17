// ============================================================
// Infinitra Build — Site Configuration
// ============================================================
// Update this file to configure cohorts, deadlines, and form endpoint.
// This is the ONLY file you need to edit between cohorts.

const CONFIG = {
  // --- Cohort settings ---
  cohort: {
    name: "September 2026",
    startDate: "2026-09-07",           // When the program starts
    applicationDeadline: "2026-08-31", // Last date to apply (YYYY-MM-DD)
    seats: 10,
  },

  // --- Application control ---
  applications: {
    // Master switch — set to false to manually close applications
    // (e.g., if seats fill before the deadline)
    open: true,

    // Message shown when applications are closed manually
    closedMessage: "Applications are fully closed for now. Leave your email to be notified about the next cohort.",

    // Message shown when deadline has passed (still allows apply for waitlist)
    deadlinePassedMessage: "The September cohort deadline has passed. You can still apply for the waitlist — if a seat opens or for the next cohort, you'll be first in line.",
  },

  // --- Google Apps Script endpoint ---
  // Paste your deployed Google Apps Script web app URL here.
  // See apps-script.js for setup instructions.
  formEndpoint: "https://script.google.com/macros/s/AKfycbzZBnOp3EH9WCtdCwEU4xI9NJSgK2-v2N8xtgRxUkdXwBp4B3iqnDSGXTYF6_5jy8wuOA/exec",

  // --- Waitlist endpoint (same sheet, different tab, or same endpoint) ---
  // Used when applications are closed — captures email for next cohort notification.
  waitlistEndpoint: "https://script.google.com/macros/s/AKfycbzZBnOp3EH9WCtdCwEU4xI9NJSgK2-v2N8xtgRxUkdXwBp4B3iqnDSGXTYF6_5jy8wuOA/exec",
};

// --- Deadline logic ---
function isApplicationOpen() {
  if (!CONFIG.applications.open) return false;

  const now = new Date();
  const deadline = new Date(CONFIG.cohort.applicationDeadline + "T23:59:59+05:30");

  return now <= deadline;
}

function getApplicationStatus() {
  if (!CONFIG.applications.open) {
    return { open: false, waitlist: false, reason: "manual", message: CONFIG.applications.closedMessage };
  }

  const now = new Date();
  const deadline = new Date(CONFIG.cohort.applicationDeadline + "T23:59:59+05:30");

  if (now > deadline) {
    return { open: true, waitlist: true, reason: "deadline", message: CONFIG.applications.deadlinePassedMessage };
  }

  // Calculate days remaining
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  return { open: true, waitlist: false, daysLeft };
}
