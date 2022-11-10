
const form = document.querySelector(".form")
const inSerial = document.querySelector(".inSerial")
const selectTeste = document.getElementById("selectTeste")
const selectFalha = document.getElementById("selectFalha")
const selectAprovado = document.getElementById("selectAprovado")
const inputFalhas = document.querySelector(".inputFalhas")
const inFalha = document.querySelector(".inFalha")
const inCicloTest = document.querySelector(".inCicloTest")
const inCicloPass = document.querySelector(".inCicloPass")
const alertContainer = document.querySelector('.alert')
const alertSuccessMsg = document.querySelector(".alert-success")
const alertWarningMsg = document.querySelector(".alert-warning")

let cameraAcessGranted = false
let selectedTipo = null

class Registro {
  constructor(serial, falha, ciclos, ciclosPass) {
    this.Serial = serial.toUpperCase();
    this.Tipo = selectedTipo.toUpperCase();
    this.Data = formatDate(new Date());
    this.Falha = falha.toUpperCase();
    this.Ciclos = ciclos;
    this.CiclosPass = ciclosPass;
    this.Percentual = calculatePercentual(this.Ciclos, this.CiclosPass)
  }
}

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return (
    `${[
      padTo2Digits(date.getDate()),
      padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('/')} ${[
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(':')}`
  );
}


function calculatePercentual(ciclos, ciclosPass) {
  if (ciclos && ciclosPass) {
    return ((ciclosPass / ciclos) * 100).toFixed(2) + "%"
  } else {
    return ""
  }
}

function validaSelected() {
  if (selectedTipo === "Teste" || selectedTipo === "Aprovado") {
    return true
  } else if (selectedTipo === "Falha") {
    if (inFalha.value && inCicloTest.value && inCicloPass.value) {
      return true
    }
  } else {
    return false
  }
}

function colapseInputFalhas() {
  inputFalhas.classList.remove("toggleInputFalhas");
  inFalha.value = ""
  inCicloTest.value = ""
  inCicloPass.value = ""
}

function resetSelectColors() {
  selectTeste.style.cssText += 'background-color:#eee';
  selectFalha.style.cssText += 'background-color:#eee';
  selectAprovado.style.cssText += 'background-color:#eee';
}

function resetAlerts() {
  alertWarningMsg.classList.remove('show-warning')
  alertSuccessMsg.classList.remove('show-success')
}

function selectTipoTeste() {
  colapseInputFalhas()
  resetSelectColors()
  selectTeste.style.cssText += 'background-color:#0097D1';
  selectedTipo = 'Teste'
}
function selectTipoFalha() {
  inputFalhas.classList.add("toggleInputFalhas");
  resetSelectColors()
  selectFalha.style.cssText += 'background-color:#e94041';
  inFalha.focus()
  selectedTipo = 'Falha'
}

function selectTipoAprovado() {
  colapseInputFalhas()
  resetSelectColors()
  selectAprovado.style.cssText += 'background-color:#60BAAE';
  selectedTipo = 'Aprovado'
}

function postOnspreadsheet() {
  const registro = new Registro(inSerial.value, inFalha.value, inCicloTest.value, inCicloPass.value)
  console.log({...registro})
  axios.post('https://sheetdb.io/api/v1/b65qa0zmwl8j4',{
        "data": {...registro}
    }).then( response => {
        console.log(response.data);
    });
}

function checkCameraPermission() {
  navigator.permissions.query({ name: 'camera' })
  .then((permissionObj) => {
    if(permissionObj.state == "denied") {
      alert(`Permission ${permissionObj.state}!`);
    }
    if(permissionObj.state == "granted") {
      console.log(`Permission ${permissionObj.state}!`)
    }
  })
  .catch((error) => {
    console.log('Got error :', error);
  })
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (validaSelected()) {
    postOnspreadsheet()
    
    resetAlerts()
    alertContainer.style.cssText += "opacity:1"
    alertSuccessMsg.classList.add('show-success')
    setTimeout(() => { resetAlerts() }, 3000);

    colapseInputFalhas()
    resetSelectColors()
    form.reset()
    document.getElementById("capturados").innerHTML = ""
  } else {
    alertWarningMsg.classList.add('show-warning')
    setTimeout(() => { resetAlerts() }, 3000);
  }
  selectedTipo = null
})

//Arrumar alert de sucesso (apenas se api sheetDb respond 200)
// Se erro criar alert vermelho ( foi salvo no local storage mas não foi envia para planilha)