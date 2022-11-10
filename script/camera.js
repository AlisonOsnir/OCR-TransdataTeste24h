const cameraContainer = document.querySelector(".cameraContainer");
const ocrProcessContainer = document.querySelector(".ocrProcessContainer");
const cameraBtn = document.querySelector(".cameraBtn");
let cameraWasClicked = false;

function startCamera() {
  checkCameraPermission()
  if (!cameraWasClicked && !scannerClicked) {
    cameraWasClicked = true;
    cameraBtn.classList.add("optionBtn-selected");
    startup();
  } else {
    video.srcObject.getTracks()[0].stop();
    cameraContainer.classList.add("hidden");
    ocrProcessContainer.classList.add("hidden");
    cameraBtn.classList.remove("optionBtn-selected");
    cameraWasClicked = false;
  }
}

// The width and height of the captured photo. We will set the width to the value defined here,
// but the height will be calculated based on the aspect ratio of the input stream.

const width = window.innerWidth;
let height = 0 //width*1.77;

let streaming = false;
let video = null;
let canvas = null;
let photo = null;
let takePhoto = null;

// function showViewLiveResultButton() {
//   if (window.self !== window.top) {
//     // If our document is in a frame, we get the user to first open it in its own tab or window.
//     // Otherwise, it won't be able to request permission for camera access.
//     document.querySelector(".contentarea").remove();
//     const button = document.createElement("button");
//     button.textContent = "View live result of the example code above";
//     document.body.append(button);
//     button.addEventListener("click", () => window.open(location.href));
//     return true;
//   }
//   return false;
// }

function startup() {
  // if (showViewLiveResultButton()) {
  //   return;
  // }
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  photo = document.getElementById("photo");
  takePhoto = document.getElementById("startbutton");

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .then(() => {
      cameraContainer.classList.remove("hidden");
      ocrProcessContainer.classList.remove("hidden");
    })
    .catch((err) => {
      console.error(`An error occurred: ${err}`);
    });

  video.addEventListener(
    "canplay",
    (ev) => {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);

        if (isNaN(height)) {
          height = width / (4 / 3);
        }

        video.setAttribute("width", width);
        video.setAttribute("height", height);
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        streaming = true;
      }
    },
    false
  );

  takePhoto.addEventListener(
    "click",
    (ev) => {
      takepicture();
      ev.preventDefault();
    },
    false
  );
  clearphoto();
}

function clearphoto() {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  const data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
}

// Capture a photo by fetching the current contents of the video
// and drawing it into a canvas, then converting that to a PNG
// format data URL. By drawing it on an offscreen canvas and then
// drawing that to the screen, we can change its size and/or apply
// other changes before drawing it.

function takepicture() {
  const context = canvas.getContext("2d");
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    thresholdFilter(data, level = 0.45); //0.58 melhorou accuracy no teste.jpg(fundo preto)
    context.putImageData(imageData, 0, 0);

    data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);

    photo.style.cssText += "opacity:1"
    startLoadingBar()
    initOCR(photo)
  } else {
    clearphoto();
  }
}

function thresholdFilter(pixels, level) {
  if (level === undefined) {
    level = 0.5;
  }
  const thresh = Math.floor(level * 255);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    let val;
    if (gray >= thresh) {
      val = 255;
    } else {
      val = 0;
    }
    pixels[i] = pixels[i + 1] = pixels[i + 2] = val;
  }
}