const cameraBtn = document.querySelector(".cameraBtn");
const cameraContainer = document.querySelector(".cameraContainer");
const settingsContainer = document.querySelector(".settingsContainer")
const switchBtn = document.querySelectorAll(".switchBtn")
const ocrProcessContainer = document.querySelector(".ocrProcessContainer");

let cameraWasClicked = false;

let settings = {
  blur: false,
  grayscale: false,
  negative: false,
  binarize: false,
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// The width and height of the captured photo. We will set the width to the value defined here,
// but the height will be calculated based on the aspect ratio of the input stream.
const width = window.innerWidth; //320
let height = 0

let streaming = false;
let photo = null

function startCamera() {
  checkCameraPermission()
  if (!cameraWasClicked && !scannerClicked) {
    cameraWasClicked = true;
    cameraBtn.classList.add("optionBtn-selected");
    startup();
  } else {
    video.srcObject.getTracks()[0].stop();
    cameraContainer.classList.remove("show");
    // ocrProcessContainer.classList.remove("show");
    cameraWasClicked = false;
    cameraBtn.classList.remove("optionBtn-selected");

    if (isMaximized) maximizeImage()
  }
}

function startup() {
  const video = document.getElementById("video");
  const takePhoto = document.getElementById("takePhoto");

  loadSettings()

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .then(() => {
      cameraContainer.classList.add("show");
      ocrProcessContainer.classList.add("show");
      drawLastPhoto()
    })
    .catch((err) => {
      console.error("Erro ao iniciar camera:\n" + err);
      cameraContainer.classList.remove("show");
      ocrProcessContainer.classList.remove("show");
      cameraWasClicked = false;
      cameraBtn.classList.remove("optionBtn-selected");
    });

  video.addEventListener(
    "canplay",
    (ev) => {
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);

        if (isNaN(height)) {
          height = width / (4 / 3); //aspect ratio
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
  clearCanvas();
}

function takePicture() {
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);

    canvas.style.cssText += "opacity: 1; display: block;";

    photo = new Image()
    photo.src = canvas.toDataURL("photo/png")
    photoWasTaken = true

    saveSettings()
    processImage(canvas, ctx)
    initOCR(canvas)
  } else {
    clearCanvas();
  }
}

function drawLastPhoto() {
  if (photo) {
    ctx.drawImage(photo, 0, 0, canvas.width, canvas.height)
    processImage(canvas, ctx)
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function saveSettings() {
  localStorage.setItem('settings', JSON.stringify(settings));
}

function loadSettings() {
  storedSettings = JSON.parse(localStorage.getItem('settings'));
  if (storedSettings) {
    settings = storedSettings
    for (let i = 0; i < Object.keys(settings).length; i++) {
      if (Object.values(settings)[i] === true) {
        switchBtn[i].checked = true
      }
    }
  }
}


let isMaximized = false
function maximizeImage() {
  video.classList.toggle("hidden")
  canvas.classList.toggle("maximizedCanvas")
  takePhoto.classList.toggle("hidden")
  settingsContainer.classList.toggle("showSettingsContainer")
  isMaximized = isMaximized ? false : true
  saveSettings()
}

//Comportamento dos switchs no canvas
for (let i = 0; i < switchBtn.length; i++) {
  switchBtn[i].addEventListener("input", (evt) => {
    settings[Object.keys(settings)[i]] = switchBtn[i].checked;
    if (photo) {
      processImage(canvas, ctx)
    }
  })
}


function processImage(canvas, ctx) {
  ctx.drawImage(photo, 0, 0, canvas.width, canvas.height)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imageData.data;

  if (settings) {
    if (settings.blur) { blurARGB(data, canvas, radius = 1) }
    if (settings.grayscale) { grayscale(data, canvas) }
    if (settings.negative) { negative(data) }
    if (settings.binarize) { otsuBinarize(canvas,data) }
  }
  ctx.putImageData(imageData, 0, 0);
}

function grayscale(data, w, h) {
  for(let i = 0; i < data.length; i += 4) {
      let brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
      data[i] = brightness;
      data[i + 1] = brightness;
      data[i + 2] = brightness;
  }
};

function negative(pixels) {
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = pixels[i] ^ 255; 
    pixels[i + 1] = pixels[i + 1] ^ 255; 
    pixels[i + 2] = pixels[i + 2] ^ 255; 
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

function otsuBinarize(canvas, data){
  let w = canvas.width, h = canvas.height;
  let histogram = hist(data, w, h);
  let threshold = otsu(histogram, w*h);
  binarize(threshold, data, w, h);
}

let RED_INTENCITY_COEF = 0.2126;
let GREEN_INTENCITY_COEF = 0.7152;
let BLUE_INTENCITY_COEF = 0.0722;

function hist(data, w, h) {
  let brightness;
  let brightness256Val;
  let histArray = Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0);

  for (let i = 0; i < data.length; i += 4) {
      brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
      brightness256Val = Math.floor(brightness);
      histArray[brightness256Val] += 1;
  }
  
  return histArray;
};

function otsu(histogram, total) {
  let sum = 0;
  for (let i = 1; i < 256; ++i)
      sum += i * histogram[i];
  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let mB;
  let mF;
  let max = 0.0;
  let between = 0.0;
  let threshold1 = 0.0;
  let threshold2 = 0.0;
  for (let i = 0; i < 256; ++i) {
      wB += histogram[i];
      if (wB == 0)
          continue;
      wF = total - wB;
      if (wF == 0)
          break;
      sumB += i * histogram[i];
      mB = sumB / wB;
      mF = (sum - sumB) / wF;
      between = wB * wF * Math.pow(mB - mF, 2);
      if ( between >= max ) {
          threshold1 = i;
          if ( between > max ) {
              threshold2 = i;
          }
          max = between;            
      }
  }
  return ( threshold1 + threshold2 ) / 2.0;
};

function binarize(threshold, data, w, h) {
  let val;
  
  for(let i = 0; i < data.length; i += 4) {
      let brightness = RED_INTENCITY_COEF * data[i] + GREEN_INTENCITY_COEF * data[i + 1] + BLUE_INTENCITY_COEF * data[i + 2];
      let val = ((brightness > threshold) ? 255 : 0);
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
  }
}