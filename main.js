const form = document.getElementById("form")
const inSerial = document.getElementById("inSerial")
const inTipo = document.getElementById("inTipo")
const inFalha = document.getElementById("inFalha")

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
  constructor(serial, tipo, falha) {
    this.serial = serial.toUpperCase();
    this.tipo = tipo.toUpperCase();
    this.falha = falha.toUpperCase()
    this.date = formatDate(new Date())
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  let registro = new Registro(inSerial.value, inTipo.value, inFalha.value)
  console.log(registro)
})