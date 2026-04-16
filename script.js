// ================= NAVIGATION =================
function goToEvents(){
    window.location.href = "events.html";
}

function goHome(){
    window.location.href = "index.html";
}

function openEvent(page){
    window.location.href = page;
}

function goToVerify(){
    window.location.href = "verify.html";
}

// ================= VERIFY (MANUAL INPUT) =================
function verifyCertificate(){

    const name = document.getElementById("verifyName").value.trim();
    const id = document.getElementById("verifyId").value.trim();

    if(!name || !id){
        alert("⚠ Enter all fields");
        return;
    }

    const encoded = btoa(`${name}|${id}`);

    window.location.href = `result.html?data=${encoded}`;
}

// ================= QR SCANNER =================
let qrScanner;
let cameras = [];
let currentCameraIndex = 0;

// START SCAN
function scanQR(){

    const qrBox = document.getElementById("qr-reader");

    if(!qrBox){
        alert("QR container missing");
        return;
    }

    qrBox.style.display = "block";
    qrBox.innerHTML = "<p style='text-align:center'>📷 Starting camera...</p>";

    qrScanner = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras()
    .then(devices => {

        if(!devices || devices.length === 0){
            alert("❌ No camera found");
            return;
        }

        cameras = devices;

        console.log("Cameras:", devices);

        // Prefer back camera
        currentCameraIndex = devices.findIndex(d =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("rear") ||
            d.label.toLowerCase().includes("environment")
        );

        if(currentCameraIndex === -1){
            currentCameraIndex = 0;
        }

        startCamera(cameras[currentCameraIndex].id);

    })
    .catch(err => {
        console.error(err);
        alert("❌ Camera access denied");
    });
}

// START CAMERA
function startCamera(cameraId){

    qrScanner.start(
        cameraId,
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        (decodedText) => onScanSuccess(decodedText),
        (error) => {}
    )
    .then(() => {
        console.log("Camera started");
    })
    .catch(err => {
        console.error(err);
        alert("❌ Failed to start camera");
    });
}

// QR SUCCESS
function onScanSuccess(qrMessage){

    console.log("QR:", qrMessage);

    if(qrScanner){
        qrScanner.stop();
    }

    // If QR is URL → open
    if(qrMessage.startsWith("http")){
        window.location.href = qrMessage;
        return;
    }

    // If base64 → convert
    try{
        const decoded = atob(qrMessage);

        if(decoded.includes("|")){
            const encoded = btoa(decoded);
            window.location.href = `result.html?data=${encoded}`;
            return;
        }

    }catch{}

    alert("❌ Invalid QR");
}

// SWITCH CAMERA
function switchCamera(){

    if(!qrScanner){
        alert("⚠ Start scanner first");
        return;
    }

    if(cameras.length < 2){
        alert("⚠ Only one camera available");
        return;
    }

    qrScanner.stop().then(() => {

        currentCameraIndex = (currentCameraIndex + 1) % cameras.length;

        console.log("Switching camera:", cameras[currentCameraIndex]);

        startCamera(cameras[currentCameraIndex].id);

    }).catch(err => {
        console.error(err);
    });
}

// ================= TYPING EFFECT =================
let text = "IOTIFY";
let i = 0;

function typing(){
    const el = document.getElementById("typing");

    if(el && i < text.length){
        el.innerHTML += text.charAt(i);
        i++;
        setTimeout(typing,150);
    }
}

// ================= PARTICLE BACKGROUND =================
window.onload = function(){

    typing();

    const canvas = document.getElementById("bg");

    if(canvas){

        const ctx = canvas.getContext("2d");

        function resizeCanvas(){
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        let particles = [];

        for(let i=0;i<100;i++){
            particles.push({
                x:Math.random()*canvas.width,
                y:Math.random()*canvas.height,
                r:Math.random()*2,
                dx:(Math.random()-0.5),
                dy:(Math.random()-0.5)
            });
        }

        function draw(){

            ctx.clearRect(0,0,canvas.width,canvas.height);

            ctx.fillStyle="#00f7ff";

            particles.forEach(p=>{

                ctx.beginPath();
                ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
                ctx.fill();

                p.x+=p.dx;
                p.y+=p.dy;

                if(p.x<0||p.x>canvas.width) p.dx*=-1;
                if(p.y<0||p.y>canvas.height) p.dy*=-1;
            });

            requestAnimationFrame(draw);
        }

        draw();
    }
};
// OPEN SCANNER
function openScanner(){
    document.getElementById("scannerOverlay").style.display = "flex";
    scanQR();
}

// CLOSE SCANNER
function closeScanner(){
    document.getElementById("scannerOverlay").style.display = "none";

    if(qrScanner){
        qrScanner.stop().catch(()=>{});
    }
}   
// Existing navigation functions...
function goToRegister() {
    window.location.href = "register.html";
}

// Popup Logic
function openPopup() {
    document.getElementById("popup").style.display = "flex";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Close popup if user clicks outside the box
window.onclick = function(event) {
    const modal = document.getElementById("popup");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}