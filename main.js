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

inSerial.focus()
let selectedTipo = null

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return (
    `${[
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-')} ${[
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(':')}`
  );
}
class Registro {
  constructor(serial, falha, ciclos, ciclosPass) {
    this.serial = serial.toUpperCase();
    this.tipo = selectedTipo.toUpperCase();
    this.date = formatDate(new Date());
    this.falha = falha.toUpperCase();
    this.ciclos = ciclos;
    this.ciclosPass = ciclosPass;
    this.percentual = getPercentual(this.ciclos, this.ciclosPass)
  }
}

function getPercentual(ciclos, ciclosPass) {
  if (ciclos && ciclosPass) {
    return (ciclosPass / ciclos) * 100 + "%"
  }else {
    return ""
  }
}


form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (validaSelected()) {
    let registro = new Registro(inSerial.value, inFalha.value, inCicloTest.value, inCicloPass.value)
    console.log(registro)
    closeInputFalhas()
    resetSelectColors()
    form.reset()
  }
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

function closeInputFalhas() {
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

function selectTipoTeste() {
  closeInputFalhas()
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
  closeInputFalhas()
  resetSelectColors()
  selectAprovado.style.cssText += 'background-color:#60BAAE';
  selectedTipo = 'Aprovado'
}

///ENVIADO ALERT?