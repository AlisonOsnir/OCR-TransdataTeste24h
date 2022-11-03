
const form = document.querySelector(".form")
const inSerial = document.querySelector(".inSerial")
const inputFalhas = document.querySelector(".inputFalhas")
const selectTipoBtn = document.querySelectorAll(".selectTipo")
const selectTeste = document.getElementById("selectTeste")
const selectFalha = document.getElementById("selectFalha")
const selectAprovado = document.getElementById("selectAprovado")
const inFalha = document.querySelector(".inFalha")
const inCicloTest = document.querySelector(".inCicloTest")
const inCicloPass = document.querySelector(".inCicloPass")
const alertSuccessMsg = document.querySelector(".alert-success")
const alertWarningMsg = document.querySelector(".alert-warning")


//inSerial.focus()
let cameraAcessGranted = false
let selectedTipo = null

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
class Registro {
  constructor(serial, falha, ciclos, ciclosPass) {
    this.Serial = serial.toUpperCase();
    this.Tipo = selectedTipo.toUpperCase();
    this.Data = formatDate(new Date());
    this.Falha = falha.toUpperCase();
    this.Ciclos = ciclos;
    this.CiclosPass = ciclosPass;
    this.Percentual = getPercentual(this.Ciclos, this.CiclosPass)
  }
}

function getPercentual(ciclos, ciclosPass) {
  if (ciclos && ciclosPass) {
    return ((ciclosPass / ciclos) * 100).toFixed(2) + "%"
  } else {
    return ""
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (validaSelected()) {
    postOnspreadsheet()
    localStoreData()

    resetAlerts()
    const alertContainer = document.querySelector('.alert')
    alertContainer.style.cssText += "opacity:1"
    alertSuccessMsg.classList.add('show-success')
    setTimeout(() => { resetAlerts() }, 3000);
    colapseInputFalhas()
    resetSelectColors()
    form.reset()
  } else {
    alertWarningMsg.classList.add('show-warning')
    setTimeout(() => { resetAlerts() }, 3000);
  }
  selectedTipo = null
})

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

function localStoreData() {
  const stored = JSON.parse(localStorage.getItem("Registro"));
  const registro = new Registro(inSerial.value, inFalha.value, inCicloTest.value, inCicloPass.value)
  if (stored != null) {
    stored.push(registro)
    localStorage.setItem("Registro", JSON.stringify(stored))
  } else {
    localStorage.setItem("Registro", JSON.stringify([registro]))
  }
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

function CSV() {
  const array = JSON.parse(localStorage.getItem("Registro"));

  // Use first element to choose the keys and the order
  var keys = Object.keys(array[0]);

  // Build header
  var result = keys.join(",") + "\n";

  // Add the rows
  array.forEach(function (obj) {
    result += keys.map(k => obj[k]).join(",") + "\n";
  });
  console.log(result)
  return result
}

function exportCSV() {
  const arr = CSV()
  const blob = new Blob([arr], { type: "text/csv" });
  const url  = window.URL.createObjectURL(blob);
  window.location.assign(url);
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
