const html5QrCode = new Html5Qrcode("scanner", /* verbose = true*/);
const scannerBtn = document.querySelector(".scannerBtn");
let scannerClicked = false;

function startScanner() {
  checkCameraPermission();

  if (!scannerClicked && !cameraWasClicked) {
    scannerClicked = true;
    scannerBtn.classList.add("optionBtn-selected");

    html5QrCode.start(
      { facingMode: "user" },
      {
        fps: 10,    
        qrbox: { width: 250, height: 250 }  // Optional, if you want bounded box UI
      },
      (decodedText, decodedResult) => {
        inSerial.value = decodedText;
        html5QrCode.stop();
        scannerClicked = false;
        scannerBtn.classList.remove("optionBtn-selected");
      },
      (errorMessage) => {
        // parse error, ignore it.
      })
      .catch((err) => {
        // Start failed, handle it.
      });

  } else {
    html5QrCode.stop();
    scannerClicked = false
    scannerBtn.classList.remove("optionBtn-selected");
  }
}