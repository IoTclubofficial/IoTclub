const SHEET_ID = "10D6MhlSzdpHd5zJUSB7-rVxZP00tNjd7oPRC0PfMs3Q";
const SHEET_NAME = "Sheet1";

function doGet() {
  return jsonResponse({
    status: "ready",
    message: "Registration backend is running"
  });
}

function doPost(e) {
  try {
    const payload = getPayload(e);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("Target sheet not found");
    }

    validatePayload(payload);
    payload.imageUrl = saveImageFile(payload);

    const row = buildRow(payload);
    const headers = getHeaders();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }

    sheet.appendRow(row);

    return htmlPostMessage({
      type: "registration_result",
      submissionId: payload.submissionId || "",
      status: "success",
      message: "Registration saved to the sheet"
    });
  } catch (error) {
    // Use best-effort submissionId when available.
    const payload = normalizePayload((e && e.parameter) ? e.parameter : {});
    return htmlPostMessage({
      type: "registration_result",
      submissionId: payload.submissionId || "",
      status: "error",
      message: error && error.message ? error.message : "Submission failed"
    });
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function htmlPostMessage(obj) {
  const safeJson = JSON.stringify(obj).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
  const html = `<!DOCTYPE html>
  <html><head><meta charset="utf-8"></head>
  <body>
    <script>
      (function(){
        try{
          window.parent.postMessage(${safeJson}, "*");
        }catch(e){}
      })();
    </script>
  </body></html>`;
  return ContentService.createTextOutput(html).setMimeType(ContentService.MimeType.HTML);
}

function getPayload(e) {
  if (!e) {
    throw new Error("No request body received");
  }

  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      return normalizePayload(e.parameter || {});
    }
  }

  if (e.parameter) {
    return normalizePayload(e.parameter);
  }

  throw new Error("No request body received");
}

function normalizePayload(payload) {
  const normalized = {};

  Object.keys(payload).forEach(function (key) {
    normalized[key] = String(payload[key] || "").trim();
  });

  return normalized;
}

function validatePayload(payload) {
  if (!payload.teamName) {
    throw new Error("Team name is required");
  }

  if (!payload.theme) {
    throw new Error("Theme is required");
  }

  if (!payload.teamSize) {
    throw new Error("Team size is required");
  }

  if (!["2", "3", "4"].includes(String(payload.teamSize))) {
    throw new Error("Only 2, 3, or 4 members are allowed");
  }

  if (!payload.fileData || !payload.fileName) {
    throw new Error("Image upload is required");
  }
}

function getHeaders() {
  return [
    "submittedAt",
    "teamName",
    "theme",
    "teamSize",
    "imageUrl",
    "leaderName",
    "leaderUSN",
    "leaderPhone",
    "leaderEmail",
    "leaderCollege",
    "leaderBranch",
    "leaderSem",
    "member2Name",
    "member2USN",
    "member2Phone",
    "member2Email",
    "member2College",
    "member2Branch",
    "member2Sem",
    "member3Name",
    "member3USN",
    "member3Phone",
    "member3Email",
    "member3College",
    "member3Branch",
    "member3Sem",
    "member4Name",
    "member4USN",
    "member4Phone",
    "member4Email",
    "member4College",
    "member4Branch",
    "member4Sem"
  ];
}

function buildRow(payload) {
  return [
    payload.submittedAt || new Date().toISOString(),
    payload.teamName || "",
    payload.theme || "",
    payload.teamSize || "",
    payload.imageUrl || "",
    payload.name_1 || "",
    payload.usn_1 || "",
    payload.phone_1 || "",
    payload.email_1 || "",
    payload.college_1 || "",
    payload.branch_1 || "",
    payload.sem_1 || "",
    payload.name_2 || "",
    payload.usn_2 || "",
    payload.phone_2 || "",
    payload.email_2 || "",
    payload.college_2 || "",
    payload.branch_2 || "",
    payload.sem_2 || "",
    payload.name_3 || "",
    payload.usn_3 || "",
    payload.phone_3 || "",
    payload.email_3 || "",
    payload.college_3 || "",
    payload.branch_3 || "",
    payload.sem_3 || "",
    payload.name_4 || "",
    payload.usn_4 || "",
    payload.phone_4 || "",
    payload.email_4 || "",
    payload.college_4 || "",
    payload.branch_4 || "",
    payload.sem_4 || "",
  ];
}

function saveImageFile(payload) {
  const matches = String(payload.fileData || "").match(/^data:(.+);base64,(.+)$/);

  if (!matches) {
    throw new Error("Invalid image data");
  }

  const contentType = payload.fileType || matches[1];
  const bytes = Utilities.base64Decode(matches[2]);
  const blob = Utilities.newBlob(bytes, contentType, payload.fileName || "upload-image");
  const file = DriveApp.createFile(blob);

  return file.getUrl();
}
