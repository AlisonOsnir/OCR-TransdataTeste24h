const { createWorker, createScheduler } = Tesseract;

const valoresCapturados = {
  'Fita de LED'   : null,
  'Buzzer'        : null,
  'Audio'         : null,
  'Luminosidade'  : null,
  'Backlight LCD' : null,
  'Contraste LCD' : null,
  'RTC'           : null,
  'Memoria NPE'   : null,
  'Ethernet 1e2'  : null,
  'Serial 232'    : null,
  'Serial 485'    : null,
  'Portas USB'    : null,
  'Term.Toradex'  : null,
  'Term.PCI Mae'  : null,
  'Nobreak'       : null,
  'CAN'           : null,
  'PoE'           : null,
  '24V ETH1'      : null,
  '24V ETH2'      : null,
  'ATIVASOL'      : null,
  'COM_COB'       : null,
  'COM_MOT'       : null,
  'IN1'           : null,
  'IN2'           : null,
  'LEGADO'        : null,
  'Sinais POS'    : null,
  'SD Card'       : null,
  'Nano Card'     : null,
  'eSIM Card'     : null,
  'SIM Card'      : null,
  'SAM Card'      : null,
  '4G'            : null,
  'GPS'           : null,
  'Acel. GPS'     : null,
  'Acel. Bosch'   : null,
  'WiFi'          : null,
  'Bluetooth'     : null,
  'EMV'           : null,
  'QR Code'       : null,
  'Mifare'        : null,
}

const testes = {
  Fita_de_LED   : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Fita\s?de\s?LED/g,      range : 1 },
  Buzzer        : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Buzzer/g,               range : 1 },
  Audio         : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Audio/g,                range : 1 },
  Luminosidade  : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Luminosidade/g,         range : 1 },
  Backlight_LCD : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Backlight\s?(LCD)?/g,   range : 1 },
  Contraste_LCD : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Contraste\s?(LCD)?/g,   range : 1 },
  RTC           : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?RTC/g,                  range : 0.95 },
  Memoria_NPE   : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Memoria\s?NPE/g,        range : 0.95 },
  Ethernet1e2   : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Ethernet\s?1\s?e\s?2/g, range : 1 },
  Serial232     : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Serial\s?232/g,         range : 0.95 },
  Serial485     : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Serial\s?485/g,         range : 0.95 },
  PortasUSB     : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Portas\s?USB/g,         range : 1 },
  Term_Toradex  : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Term.\s?Toradex/g,      range : 0.95 },
  Term_PCI_Mãe  : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Term.\s?PCI\s?(Mãe)?/g, range : 0.95 },
  Nobreak       : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Nobreak/g,              range : 1 },
  CAN           : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?CAN/g,                  range : 1 },
  PoE           : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?PoE/g,                  range : 1 },
  ETH1          : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?24V-?\s?ETH1/g,         range : 1 },
  ETH2          : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?24V-?\s?ETH2/g,         range : 1 },
  ATIVASOL      : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?ATIVASOL/g,             range : 1 },
  COM_COB       : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?COM_?.\s?COB/g,         range : 1 },
  COM_MOT       : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?COM_?.\s?MOT/g,         range : 1 },
  IN1           : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?IN1/g,                  range : 1 },
  IN2           : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?IN2/g,                  range : 1 },
  LEGADO        : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?LEGADO/g,               range : 1 },
  SinaisPOS     : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Sinais\s?POS/g,         range : 1 },
  SD_Card       : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?SD\s?(Card)?/g,         range : 0.95 },
  Nano_Card     : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Nan[o,e]\s?(Card)?/g,   range : 0.95 },
  eSIM_Card     : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?eSIM\s?(Card)?/g,       range : 0.95 },
  SIM_Card      : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?SIM\s?(Card)?/g,        range : 0.95 },
  SAM_Card      : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?SAM\s?(Card)?/g,        range : 0.95 },
  Placa_4G      : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?4G/g,                   range : 0.75 },
  GPS           : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?GPS/g,                  range : 0.75 },
  Acel_GPS      : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Acel.?\s?GPS/g,         range : 0.75 },
  Acel_Bosch    : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Acel.?\s?Bosch/g,       range : 0.75 },
  WiFi          : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?WiFi/g,                 range : 0.75 },
  Bluetooth     : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Bluetooth/g,            range : 0.95 },
  EMV           : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?EMV/g,                  range : 0.95 },
  QR_Code       : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?QR\s?(Code)?/g,         range : 0.75 },
  Mifare        : { regExp : /[\({]\d{1,3}?\/\d{1,3}?[}\)]\s?Mifare/g,               range : 0.95 },
}

async function ocrPhoto(imagePath) {

  const worker = createWorker({
    logger: m => {
      // console.log(m)
      if (m.status === 'recognizing text')
        ldProgress = m.progress.toFixed(1)*100;
    }
  });
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(imagePath);
  // console.log(text);
  await worker.terminate();
  return text
}

function processData(text) {
  let data = text;
  data = data.replace(/\n/g, '');
  return data
}

function getValues(data) {
  const texto = data;

  for (let i = 0; i < Object.keys(valoresCapturados).length; i++) {
    if (Object.values(valoresCapturados)[i] !== null){ 
      continue
    }

    const inicioParenteses = texto.search(Object.values(testes)[i]['regExp']);
    if (inicioParenteses != -1) {
      const finalParenteses = texto.indexOf(")", inicioParenteses);
      let valoresRaw = texto.substr(inicioParenteses, (finalParenteses - inicioParenteses) + 1);
      let valores = valoresRaw.slice(1, -1);
      valores = valores.split("/");

      valores = valores.map(function (str) {
        return parseInt(str)
      });

      let resultado = calculate(valores);
      valoresCapturados[Object.keys(valoresCapturados)[i]] = resultado;
    } else {
      continue
    }
  }
}

function calculate (valores){
  let resultado;
  if(valores[0] > 0) {
    resultado = (valores[1] / valores[0]);
  } else {
    resultado = 0;   //Erro???
  }

  if (isNaN(resultado) || resultado > 1 || resultado < 0) {
    console.error(`Resultado invalido! -> ${valores[0], valores[1]}`);
    resultado = null;
  } else {
    resultado = resultado.toFixed(2);
  }
  return resultado
}

let loading = 0;
let ldProgress = 0;
function startLoadingBar() {
  if (loading == 0) {
    loading = 1;
    const elem = document.getElementById("myBar");
    let width = 1;
    const id = setInterval(frame, 100);
    function frame() {
      if (width >= 100) {
        clearInterval(id);
        loading = 0;
        ldProgress = 0;
      } else {
        width = ldProgress;
        elem.style.width = width + "%";
      }
    }
  }
}

//CRIAR DOM FRAGMENT
function renderValoresCapturados () {
  document.getElementById("capturados").innerHTML = null;
  for(const [key, value] of Object.entries(valoresCapturados)) {
    let index = 0;
    if(value === null) {
      document.getElementById("capturados").innerHTML += `<pre class="capturados-pendente">--- ${key}</pre>`; 
    } else if (value >= Object.values(testes)[index]['range'] ) {
      document.getElementById("capturados").innerHTML += `<pre class="capturados-aprovado">${value*100}% ${key}</pre>`; 
    } else  {
      document.getElementById("capturados").innerHTML += `<pre class="capturados-reprovado">${value*100}% ${key}</pre>`; 
    }
    index++
  }
  console.log(valoresCapturados); // Para teste
}

async function initOCR(imagePath) {
  let text = await ocrPhoto(imagePath);
  let data = processData(text);
  getValues(data);
  renderValoresCapturados();
}
