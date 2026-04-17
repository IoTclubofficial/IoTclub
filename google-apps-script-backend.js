const SHEET_ID = "13lIqejgPOdLtSKo_zDZwhuyc_00xqOU8eZ04AlBzU3E";
const SHEET_NAME = "Sheet1";

// ================= BASIC CHECK =================
function doGet() {
  return jsonResponse({
    status: "ready",
    message: "Registration backend is running"
  });
}

// ================= MAIN POST =================
function doPost(e) {
  try {
    const payload = getPayload(e);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) throw new Error("Target sheet not found");

    validatePayload(payload);

    // Save image
    payload.imageUrl = saveImageFile(payload);

    const headers = getHeaders();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }

    const row = buildRow(payload);
    sheet.appendRow(row);

    return htmlPostMessage({
      type: "registration_result",
      status: "success",
      message: "Registration saved successfully"
    });

  } catch (error) {
    return htmlPostMessage({
      type: "registration_result",
      status: "error",
      message: error.message || "Submission failed"
    });
  }
}

// ================= HELPERS =================
function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function htmlPostMessage(obj) {
  const safeJson = JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

  const html = `<!DOCTYPE html>
  <html><body>
    <script>
      window.parent.postMessage(${safeJson}, "*");
    </script>
  </body></html>`;

  return ContentService.createTextOutput(html)
    .setMimeType(ContentService.MimeType.HTML);
}

// ================= PAYLOAD =================
function getPayload(e) {
  if (!e) throw new Error("No request received");

  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch {
      return normalizePayload(e.parameter || {});
    }
  }

  if (e.parameter) return normalizePayload(e.parameter);

  throw new Error("No request body");
}

function normalizePayload(payload) {
  const obj = {};
  Object.keys(payload).forEach(k => {
    obj[k] = String(payload[k] || "").trim();
  });
  return obj;
}

// ================= VALIDATION =================
function validatePayload(p) {

  if (!p.teamName) throw new Error("Team name required");
  if (!p.theme) throw new Error("Theme required");
  if (!p.teamSize) throw new Error("Team size required");

  if (!["1","2","3","4"].includes(String(p.teamSize))) {
    throw new Error("Invalid team size");
  }

  // Leader validation
  if (!p.name_1) throw new Error("Leader name required");
  if (!p.phone_1) throw new Error("Leader phone required");
  if (!p.email_1) throw new Error("Leader email required");

  // Image required
  if (!p.fileData || !p.fileName) {
    throw new Error("Payment screenshot required");
  }
}

// ================= HEADERS =================
function getHeaders() {
  return [
    "Timestamp",
    "TeamName",
    "Theme",
    "TeamSize",
    "ImageURL",

    "LeaderName",
    "LeaderUSN",
    "LeaderPhone",
    "LeaderEmail",
    "LeaderCollege",
    "LeaderBranch",
    "LeaderSem"
  ];
}

// ================= BUILD ROW =================
function buildRow(p) {
  return [
    new Date(),

    p.teamName || "",
    p.theme || "",
    p.teamSize || "",
    p.imageUrl || "",

    p.name_1 || "",
    p.usn_1 || "",
    p.phone_1 || "",
    p.email_1 || "",
    p.college_1 || "",
    p.branch_1 || "",
    p.sem_1 || ""
  ];
}

// ================= IMAGE UPLOAD =================
function saveImageFile(payload) {

  const raw = String(payload.fileData || "").trim();
  const matches = raw.match(/^data:(.+);base64,(.+)$/);

  if (!matches) throw new Error("Invalid image data");

  const contentType = payload.fileType || matches[1];

  let base64 = matches[2];
  base64 = base64.replace(/ /g, "+").replace(/\s/g, "");

  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, contentType, payload.fileName || "upload");

  const file = DriveApp.createFile(blob);

  return file.getUrl();
}

