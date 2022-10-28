// This method will trigger user permissions
// Html5Qrcode.getCameras().then(devices => {
//   /**
//    * devices would be an array of objects of type:
//    * { id: "id", label: "label" }
//    */
//   if (devices && devices.length) {
//     var cameraId = devices[0].id;
//     // .. use this to start scanning.
//   }
// }).catch(err => {
//   // handle err
// });

const scannerBtn = document.querySelector(".scannerBtn")

let scannerClicked = false;
const html5QrCode = new Html5Qrcode(/* element id */ "reader");
//const html5QrCode = new Html5Qrcode("reader", /* verbose= */ true); //To print all logs

function startScanner() {
  if (!scannerClicked && !cameraWasClicked) {
    scannerClicked = true;
    scannerBtn.style.cssText += "background: linear-gradient(90deg, rgba(255,96,0,.6) 0%, rgba(255,75,110,.6) 49%, rgba(195,9,43,.6) 100%)";

    html5QrCode.start(
      { facingMode: "user" }, //cameraId => cameratraseira({ facingMode: "environment" })
      {
        fps: 10,    // Optional, frame per seconds for qr code scanning
        qrbox: { width: 250, height: 250 }  // Optional, if you want bounded box UI
      },
      (decodedText, decodedResult) => {
        // Handle on success condition with the decoded text or result.
        console.log(`Scan result: ${decodedText}`, decodedResult);
        inSerial.value = decodedText
        html5QrCode.stop();
        scannerClicked = false;
        scannerBtn.style.cssText += "background: #EEE";
        // ^ this will stop the scanner (video feed) and clear the scan area.
      },
      (errorMessage) => {
        // parse error, ignore it.
      })
      .catch((err) => {
        // Start failed, handle it.
      });
  } else {
    html5QrCode.stop();
    setTimeout(() => {
      scannerClicked = false
      scannerBtn.style.cssText += "background: #EEE";
    }, 1000)
  }
}

// startScanner()