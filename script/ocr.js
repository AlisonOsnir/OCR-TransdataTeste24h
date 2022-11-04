const { createWorker, createScheduler } = Tesseract;

const valoresCapturados = {
  Fita_de_LED   : null,
  Buzzer        : null,
  Audio         : null,
  Luminosidade  : null,
  Backlight_LCD : null,
  Contraste_LCD : null,
  RTC           : null,
  Memoria_NPE   : null,
  Ethernet1e2   : null,
  Serial232     : null,
  Serial485     : null,
  PortasUSB     : null,
  Term_Toradex  : null,
  Term_PCI_Mãe  : null,
  Nobreak       : null,
  CAN           : null,
  PoE           : null,
  ETH1          : null,
  ETH2          : null,
  ATIVASOL      : null,
  COM_COB       : null,
  COM_MOT       : null,
  IN1           : null,
  IN2           : null,
  LEGADO        : null,
  SinaisPOS     : null,
  SD_Card       : null,
  Nano_Card     : null,
  eSIM_Card     : null,
  SIM_Card      : null,
  SAM_Card      : null,
  Sinal_4G      : null,
  GPS           : null,
  Acel_GPS      : null,
  Acel_Bosch    : null,
  WiFi          : null,
  Bluetooth     : null,
  EMV           : null,
  QR_Code       : null,
  Mifare        : null,
}

const regex = {
  Fita_de_LED   : /\(\d{1,3}?\/\d{1,3}?\)\s?Fita\s?de\s?LED/g,
  Buzzer        : /\(\d{1,3}?\/\d{1,3}?\)\s?Buzzer/g,
  Audio         : /\(\d{1,3}?\/\d{1,3}?\)\s?Audio/g,
  Luminosidade  : /\(\d{1,3}?\/\d{1,3}?\)\s?Luminosidade/g,
  Backlight_LCD : /\(\d{1,3}?\/\d{1,3}?\)\s?Backlight\s?LCD/g,
  Contraste_LCD : /\(\d{1,3}?\/\d{1,3}?\)\s?Contraste\s?LCD/g,
  RTC           : /\(\d{1,3}?\/\d{1,3}?\)\s?RTC/g,
  Memoria_NPE   : /\(\d{1,3}?\/\d{1,3}?\)\s?Memoria\s?NPE/g,
  Ethernet1e2   : /\(\d{1,3}?\/\d{1,3}?\)\s?Ethernet\s?1\s?e\s?2/g,
  Serial232     : /\(\d{1,3}?\/\d{1,3}?\)\s?Serial\s?232/g,
  Serial485     : /\(\d{1,3}?\/\d{1,3}?\)\s?Serial\s?485/g,
  PortasUSB     : /\(\d{1,3}?\/\d{1,3}?\)\s?Portas\s?USB/g,
  Term_Toradex  : /\(\d{1,3}?\/\d{1,3}?\)\s?Term.\s?Toradex/g,
  Term_PCI_Mãe  : /\(\d{1,3}?\/\d{1,3}?\)\s?Term.\s?PCI\s?(Mãe)?/g,
  Nobreak       : /\(\d{1,3}?\/\d{1,3}?\)\s?Nobreak/g,
  CAN           : /\(\d{1,3}?\/\d{1,3}?\)\s?CAN/g,
  PoE           : /\(\d{1,3}?\/\d{1,3}?\)\s?PoE/g,
  ETH1          : /\(\d{1,3}?\/\d{1,3}?\)\s?24V-?\s?ETH1/g,
  ETH2          : /\(\d{1,3}?\/\d{1,3}?\)\s?24V-?\s?ETH2/g,
  ATIVASOL      : /\(\d{1,3}?\/\d{1,3}?\)\s?ATIVASOL/g,
  COM_COB       : /\(\d{1,3}?\/\d{1,3}?\)\s?COM_COB/g,
  COM_MOT       : /\(\d{1,3}?\/\d{1,3}?\)\s?COM_MOT/g,
  IN1           : /\(\d{1,3}?\/\d{1,3}?\)\s?IN1/g,
  IN2           : /\(\d{1,3}?\/\d{1,3}?\)\s?IN2/g,
  LEGADO        : /\(\d{1,3}?\/\d{1,3}?\)\s?LEGADO/g,
  SinaisPOS     : /\(\d{1,3}?\/\d{1,3}?\)\s?Sinais\s?POS/g,
  SD_Card       : /\(\d{1,3}?\/\d{1,3}?\)\s?SD\s?(Card)?/g,
  Nano_Card     : /\(\d{1,3}?\/\d{1,3}?\)\s?Nan[o,e]\s?(Card)?/g,
  eSIM_Card     : /\(\d{1,3}?\/\d{1,3}?\)\s?eSIM\s?(Card)?/g,
  SIM_Card      : /\(\d{1,3}?\/\d{1,3}?\)\s?SIM\s?(Card)?/g,
  SAM_Card      : /\(\d{1,3}?\/\d{1,3}?\)\s?SAM\s?(Card)?/g,
  Sinal_4G      : /\(\d{1,3}?\/\d{1,3}?\)\s?4G/g,
  GPS           : /\(\d{1,3}?\/\d{1,3}?\)\s?GPS/g,
  Acel_GPS      : /\(\d{1,3}?\/\d{1,3}?\)\s?Acel.?\s?GPS/g,
  Acel_Bosch    : /\(\d{1,3}?\/\d{1,3}?\)\s?Acel.?\s?Bosch/g,
  WiFi          : /\(\d{1,3}?\/\d{1,3}?\)\s?WiFi/g,
  Bluetooth     : /\(\d{1,3}?\/\d{1,3}?\)\s?Bluetooth/g,
  EMV           : /\(\d{1,3}?\/\d{1,3}?\)\s?EMV/g,
  QR_Code       : /\(\d{1,3}?\/\d{1,3}?\)\s?QR\s?Code/g,
  Mifare        : /\(\d{1,3}?\/\d{1,3}?\)\s?Mifare/g
}

async function ocrPhoto(imagePath) {

  const worker = createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data: { text } } = await worker.recognize(imagePath);
  console.log(text);
  await worker.terminate();
  return text
}

function processData(text) {
  // let data = textArr.join('')  //Se OCR retornar Array
  let data = text
  data = data.replace(/\n/g, '')
  return data
}

function getValues(data) {
  const valoresCapturadosKeys = Object.keys(valoresCapturados)
  let re = Object.values(regex)
  let texto = data
  let contagemErros = 0
  
  for (let i = 0; i < re.length; i++) {
    const valoresCapturadosValues = Object.values(valoresCapturados)
    if (valoresCapturadosValues[i] !== null){ 
      continue
    }
      
    const inicioParentese = texto.search(re[i])

    if (inicioParentese != -1) {
      const finalParentese = texto.indexOf(")", inicioParentese)

      let valores = texto.substr(inicioParentese, (finalParentese - inicioParentese) + 1)
      valores = valores.slice(1, -1)
      valores = valores.split("/")
      valores = valores.map(function (str) {
        return parseInt(str);
      });

      let resultado = (valores[1] / valores[0]) * 100

      if (isNaN(resultado)) {
        resultado = "0%"
      } else {
        resultado = resultado.toFixed() + "%"
      }
      // console.log({inicioParentese, finalParentese, valores, resultado })
      // texto = texto.replace(re[i], `\n${resultado} $&`) // apenas add % antes dos ciclos

      // Atribui valores capturado no objeto
      valoresCapturados[valoresCapturadosKeys[i]] = resultado
      document.getElementById("demo").innerHTML += (`${resultado} - ${valoresCapturadosKeys[i]}<br>`); //assim pode mostrar novamete na proxima foto
      console.log(valoresCapturados)
    } else {
      //cuidar de erro se match não encontrado
      contagemErros++
      continue
    }
  }
  console.log(`Contagem de erros = ${contagemErros}`) //Apenas para teste
}



async function initOCR(imagePath) {
  let text = await ocrPhoto(imagePath)
  let data = processData(text)
  getValues(data)
}

