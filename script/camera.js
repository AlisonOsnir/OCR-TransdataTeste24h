const cameraContainer = document.querySelector(".cameraContainer");
const ocrProcessContainer = document.querySelector(".ocrProcessContainer");
const cameraBtn = document.querySelector(".cameraBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


const switchBtn = document.querySelectorAll(".switchBtn")
const rangeThresholdDiv = document.querySelector(".threshold")
const rangeSelector = document.getElementById("binarization")
const rangeValue = document.getElementById("thresholdValue")

let cameraWasClicked = false;

// The width and height of the captured photo. We will set the width to the value defined here,
// but the height will be calculated based on the aspect ratio of the input stream.

const width = window.innerWidth;
let height = 0 //width*1.77;

let streaming = false;


function startup() {
  const video = document.getElementById("video");
  const photo = document.getElementById("photo");
  const takePhoto = document.getElementById("startbutton");

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .then(() => {
      cameraContainer.classList.add("show");
      ocrProcessContainer.classList.add("show");
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
      takePicture();
      ev.preventDefault();
    },
    false
  );
  clearPhoto();
}

// Capture a photo by fetching the current contents of the video and drawing it into a canvas,
// then converting that to a PNG format data URL.
// By drawing it on an offscreen canvas and then drawing that to the screen,
// we can change its size and/or apply other changes before drawing it.

function takePicture() {
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);
    photo.style.cssText += "opacity:1"

    preprocessPhoto(canvas, ctx)
    // saveSettings()
    startLoadingBar()
    initOCR(photo)
  } else {
    clearPhoto();
  }
}

function clearPhoto() {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  const data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
}

function startCamera() {
  checkCameraPermission()
  if (!cameraWasClicked && !scannerClicked) {
    cameraWasClicked = true;
    cameraBtn.classList.add("optionBtn-selected");
    startup();
  } else {
    video.srcObject.getTracks()[0].stop();
    cameraContainer.classList.remove("show");
    ocrProcessContainer.classList.remove("show");
    cameraBtn.classList.remove("optionBtn-selected");
    cameraWasClicked = false;
  }
}




let settings = {
  blur: false,
  dilate: false,
  invertColors: false,
  thresholdFilter: false,
  thresholdRange: rangeSelector.value,
};

//SAVE AND LOAD SETTINGS

// function saveSettings() {
//   localStorage.setItem('settings', JSON.stringify(settings));
// }

// storedSettings = JSON.parse(localStorage.getItem('settings'));

// if (storedSettings) {
//   settings = storedSettings

//   for (let i = 0; i < Object.keys(settings).length - 1; i++) {
//     if (Object.values(settings)[i] === true) {
//       switchBtn[i].checked = true
//     }
//     if (switchBtn[3].checked) {
//       rangeThresholdDiv.classList.toggle("show")
//     }
//   }
// }



for (let i = 0; i < switchBtn.length; i++) {
  switchBtn[i].addEventListener("input", (evt) => {
    settings[Object.keys(settings)[i]] = switchBtn[i].checked
    if (i === 3) {
      rangeThresholdDiv.classList.toggle("show")
    }
    preprocessPhoto(canvas, ctx)
  })
}





rangeSelector.addEventListener('input', function () {
  rangeValue.textContent = this.value;
  settings.thresholdRange = this.value
});

rangeSelector.value = settings.thresholdRange

function preprocessPhoto(canvas, ctx) {
  rangeValue.innerText = rangeSelector.value

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imageData.data;

  if (settings) {
    if (settings.blur) { blurARGB(data, canvas, radius = 1) }
    if (settings.dilate) { dilate(data, canvas) }
    if (settings.invertColors) { invertColors(data) }
    if (settings.thresholdFilter) { thresholdFilter(data, level = rangeSelector.value); } //0.46 
  }

  ctx.putImageData(imageData, 0, 0);

  data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
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

function invertColors(pixels) {
  for (var i = 0; i < pixels.length; i += 4) {
    pixels[i] = pixels[i] ^ 255; // Invert Red
    pixels[i + 1] = pixels[i + 1] ^ 255; // Invert Green
    pixels[i + 2] = pixels[i + 2] ^ 255; // Invert Blue
  }
}

function getARGB(data, i) {
  const offset = i * 4;
  return (
    ((data[offset + 3] << 24) & 0xff000000) |
    ((data[offset] << 16) & 0x00ff0000) |
    ((data[offset + 1] << 8) & 0x0000ff00) |
    (data[offset + 2] & 0x000000ff)
  );
};

function setPixels(pixels, data) {
  let offset = 0;
  for (let i = 0, al = pixels.length; i < al; i++) {
    offset = i * 4;
    pixels[offset + 0] = (data[i] & 0x00ff0000) >>> 16;
    pixels[offset + 1] = (data[i] & 0x0000ff00) >>> 8;
    pixels[offset + 2] = data[i] & 0x000000ff;
    pixels[offset + 3] = (data[i] & 0xff000000) >>> 24;
  }
};

// internal kernel stuff for the gaussian blur filter
let blurRadius;
let blurKernelSize;
let blurKernel;
let blurMult;

function buildBlurKernel(r) {
  let radius = (r * 3.5) | 0;
  radius = radius < 1 ? 1 : radius < 248 ? radius : 248;

  if (blurRadius !== radius) {
    blurRadius = radius;
    blurKernelSize = (1 + blurRadius) << 1;
    blurKernel = new Int32Array(blurKernelSize);
    blurMult = new Array(blurKernelSize);
    for (let l = 0; l < blurKernelSize; l++) {
      blurMult[l] = new Int32Array(256);
    }

    let bk, bki;
    let bm, bmi;

    for (let i = 1, radiusi = radius - 1; i < radius; i++) {
      blurKernel[radius + i] = blurKernel[radiusi] = bki = radiusi * radiusi;
      bm = blurMult[radius + i];
      bmi = blurMult[radiusi--];
      for (let j = 0; j < 256; j++) {
        bm[j] = bmi[j] = bki * j;
      }
    }
    bk = blurKernel[radius] = radius * radius;
    bm = blurMult[radius];

    for (let k = 0; k < 256; k++) {
      bm[k] = bk * k;
    }
  }
}

function blurARGB(pixels, canvas, radius) {
  const width = canvas.width;
  const height = canvas.height;
  const numPackedPixels = width * height;
  const argb = new Int32Array(numPackedPixels);
  for (let j = 0; j < numPackedPixels; j++) {
    argb[j] = getARGB(pixels, j);
  }
  let sum, cr, cg, cb, ca;
  let read, ri, ym, ymi, bk0;
  const a2 = new Int32Array(numPackedPixels);
  const r2 = new Int32Array(numPackedPixels);
  const g2 = new Int32Array(numPackedPixels);
  const b2 = new Int32Array(numPackedPixels);
  let yi = 0;
  buildBlurKernel(radius);
  let x, y, i;
  let bm;
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      cb = cg = cr = ca = sum = 0;
      read = x - blurRadius;
      if (read < 0) {
        bk0 = -read;
        read = 0;
      } else {
        if (read >= width) {
          break;
        }
        bk0 = 0;
      }
      for (i = bk0; i < blurKernelSize; i++) {
        if (read >= width) {
          break;
        }
        const c = argb[read + yi];
        bm = blurMult[i];
        ca += bm[(c & -16777216) >>> 24];
        cr += bm[(c & 16711680) >> 16];
        cg += bm[(c & 65280) >> 8];
        cb += bm[c & 255];
        sum += blurKernel[i];
        read++;
      }
      ri = yi + x;
      a2[ri] = ca / sum;
      r2[ri] = cr / sum;
      g2[ri] = cg / sum;
      b2[ri] = cb / sum;
    }
    yi += width;
  }
  yi = 0;
  ym = -blurRadius;
  ymi = ym * width;
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      cb = cg = cr = ca = sum = 0;
      if (ym < 0) {
        bk0 = ri = -ym;
        read = x;
      } else {
        if (ym >= height) {
          break;
        }
        bk0 = 0;
        ri = ym;
        read = x + ymi;
      }
      for (i = bk0; i < blurKernelSize; i++) {
        if (ri >= height) {
          break;
        }
        bm = blurMult[i];
        ca += bm[a2[read]];
        cr += bm[r2[read]];
        cg += bm[g2[read]];
        cb += bm[b2[read]];
        sum += blurKernel[i];
        ri++;
        read += width;
      }
      argb[x + yi] =
        ((ca / sum) << 24) |
        ((cr / sum) << 16) |
        ((cg / sum) << 8) |
        (cb / sum);
    }
    yi += width;
    ymi += width;
    ym++;
  }
  setPixels(pixels, argb);
}

function dilate(pixels, canvas) {
  let currIdx = 0;
  const maxIdx = pixels.length ? pixels.length / 4 : 0;
  const out = new Int32Array(maxIdx);
  let currRowIdx, maxRowIdx, colOrig, colOut, currLum;

  let idxRight, idxLeft, idxUp, idxDown;
  let colRight, colLeft, colUp, colDown;
  let lumRight, lumLeft, lumUp, lumDown;

  while (currIdx < maxIdx) {
    currRowIdx = currIdx;
    maxRowIdx = currIdx + canvas.width;
    while (currIdx < maxRowIdx) {
      colOrig = colOut = getARGB(pixels, currIdx);
      idxLeft = currIdx - 1;
      idxRight = currIdx + 1;
      idxUp = currIdx - canvas.width;
      idxDown = currIdx + canvas.width;

      if (idxLeft < currRowIdx) {
        idxLeft = currIdx;
      }
      if (idxRight >= maxRowIdx) {
        idxRight = currIdx;
      }
      if (idxUp < 0) {
        idxUp = 0;
      }
      if (idxDown >= maxIdx) {
        idxDown = currIdx;
      }
      colUp = getARGB(pixels, idxUp);
      colLeft = getARGB(pixels, idxLeft);
      colDown = getARGB(pixels, idxDown);
      colRight = getARGB(pixels, idxRight);

      //compute luminance
      currLum =
        77 * ((colOrig >> 16) & 0xff) +
        151 * ((colOrig >> 8) & 0xff) +
        28 * (colOrig & 0xff);
      lumLeft =
        77 * ((colLeft >> 16) & 0xff) +
        151 * ((colLeft >> 8) & 0xff) +
        28 * (colLeft & 0xff);
      lumRight =
        77 * ((colRight >> 16) & 0xff) +
        151 * ((colRight >> 8) & 0xff) +
        28 * (colRight & 0xff);
      lumUp =
        77 * ((colUp >> 16) & 0xff) +
        151 * ((colUp >> 8) & 0xff) +
        28 * (colUp & 0xff);
      lumDown =
        77 * ((colDown >> 16) & 0xff) +
        151 * ((colDown >> 8) & 0xff) +
        28 * (colDown & 0xff);

      if (lumLeft > currLum) {
        colOut = colLeft;
        currLum = lumLeft;
      }
      if (lumRight > currLum) {
        colOut = colRight;
        currLum = lumRight;
      }
      if (lumUp > currLum) {
        colOut = colUp;
        currLum = lumUp;
      }
      if (lumDown > currLum) {
        colOut = colDown;
        currLum = lumDown;
      }
      out[currIdx++] = colOut;
    }
  }
  setPixels(pixels, out);
};