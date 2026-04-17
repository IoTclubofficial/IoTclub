const API_URL = "https://script.google.com/macros/s/AKfycbwf9sw63pu0e6ymclCLuZ7aaC-7O5Sfu7UHEr2LgZl46DceFGLQ8jibOyIy4_c_3Llg1Q/exec";

// ================= UTILITIES =================
function encodeData(data) {
    return btoa(unescape(encodeURIComponent(data)));
}

function decodeData(data) {
    return decodeURIComponent(escape(atob(data)));
}

function safeGet(id) {
    return document.getElementById(id);
}

// ================= NAVIGATION =================
function goTo(page) { window.location.href = page; }
function goToEvents() { goTo("events.html"); }
function goHome() { goTo("index.html"); }
function goToVerify() { goTo("verify.html"); }
function goToRegister() { goTo("index.html"); }
function openEvent(page) { goTo(page); }

// ================= FORM SUBMISSION =================
function submitForm(event) {
    event.preventDefault();

    const fileInput = safeGet("fileUpload");
    const file = fileInput?.files[0];

    if (!file) {
        alert("⚠ Upload payment screenshot");
        return;
    }

    const data = {
        teamName: safeGet("teamName")?.value,
        theme: safeGet("theme")?.value,
        teamSize: safeGet("teamSize")?.value,

        // Leader (IMPORTANT: backend expects these names)
        name_1: safeGet("leaderName")?.value,
        usn_1: safeGet("leaderUSN")?.value,
        phone_1: safeGet("leaderPhone")?.value,
        email_1: safeGet("leaderEmail")?.value,
        college_1: safeGet("leaderCollege")?.value,
        branch_1: safeGet("leaderBranch")?.value,
        sem_1: safeGet("leaderSem")?.value
    };

    const reader = new FileReader();

    reader.onload = function () {
        data.fileData = reader.result;
        data.fileName = file.name;
        data.fileType = file.type;

        sendToBackend(data);
    };

    reader.readAsDataURL(file);
}

function sendToBackend(data) {

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(data)
    })
    .then(res => res.text()) // Apps Script returns HTML
    .then(() => {
        alert("✅ Registration Successful!");
    })
    .catch(err => {
        console.error(err);
        alert("❌ Submission failed");
    });
}

// ================= VERIFY =================
function verifyCertificate() {

    const name = safeGet("verifyName")?.value.trim();
    const id = safeGet("verifyId")?.value.trim();

    if (!name || !id) {
        alert("⚠ Enter all fields");
        return;
    }

    const encoded = encodeData(`${name}|${id}`);
    window.location.href = `result.html?data=${encoded}`;
}

// ================= QR SCANNER =================
let qrScanner = null;
let cameras = [];
let currentCameraIndex = 0;

function scanQR() {

    const qrBox = safeGet("qr-reader");

    if (!qrBox) {
        alert("QR container missing");
        return;
    }

    if (typeof Html5Qrcode === "undefined") {
        alert("QR Scanner failed to load.");
        return;
    }

    qrBox.style.display = "block";
    qrBox.innerHTML = "📷 Starting camera...";

    qrScanner = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras()
        .then(devices => {

            if (!devices.length) {
                alert("No camera found");
                return;
            }

            cameras = devices;

            currentCameraIndex = devices.findIndex(d =>
                d.label.toLowerCase().includes("back")
            );

            if (currentCameraIndex === -1) currentCameraIndex = 0;

            startCamera(cameras[currentCameraIndex].id);
        })
        .catch(() => alert("Camera access denied"));
}

function startCamera(cameraId) {
    if (!qrScanner) return;

    qrScanner.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        onScanSuccess
    );
}

function onScanSuccess(qrMessage) {

    if (qrScanner) qrScanner.stop();

    if (qrMessage.startsWith("http")) {
        window.location.href = qrMessage;
        return;
    }

    try {
        const decoded = decodeData(qrMessage);

        if (decoded.includes("|")) {
            window.location.href = `result.html?data=${encodeData(decoded)}`;
            return;
        }

    } catch {}

    alert("Invalid QR");
}

function switchCamera() {

    if (!qrScanner || cameras.length < 2) {
        alert("No alternate camera");
        return;
    }

    qrScanner.stop().then(() => {
        currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
        startCamera(cameras[currentCameraIndex].id);
    });
}

// ================= SCANNER OVERLAY =================
function openScanner() {
    const el = safeGet("scannerOverlay");
    if (!el) return;

    el.style.display = "flex";
    scanQR();
}

function closeScanner() {
    const el = safeGet("scannerOverlay");
    if (!el) return;

    el.style.display = "none";
    if (qrScanner) qrScanner.stop();
}

// ================= EFFECTS =================
let text = "IOTIFY";
let i = 0;

function typing() {
    const el = safeGet("typing");

    if (el && i < text.length) {
        el.innerHTML += text.charAt(i);
        i++;
        setTimeout(typing, 150);
    }
}

function initParticles() {
    const canvas = safeGet("bg");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
    }

    resize();
    addEventListener("resize", resize);

    let particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2,
        dx: Math.random() - 0.5,
        dy: Math.random() - 0.5
    }));

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        });

        requestAnimationFrame(draw);
    }

    draw();
}

// ================= POPUP =================
function openPopup() {
    const el = safeGet("popup");
    if (el) el.style.display = "flex";
}

function closePopup() {
    const el = safeGet("popup");
    if (el) el.style.display = "none";
}

window.addEventListener("click", e => {
    const modal = safeGet("popup");
    if (e.target === modal) modal.style.display = "none";
});

// ================= INIT =================
window.onload = function () {
    typing();
    initParticles();
};


