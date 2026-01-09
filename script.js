const toggleSci = document.getElementById("toggleSci");
const calc = document.querySelector(".calc");

toggleSci.addEventListener("click", () => {
  calc.classList.toggle("scientific");
});

const screen = document.getElementById("screen");
const historyEl = document.getElementById("history");
const keys = document.querySelector(".keys");

let current = "0";
let prev = null;
let op = null;
let justEvaluated = false;

function update() {
  screen.value = current;
  historyEl.textContent = prev !== null && op ? `${prev} ${prettyOp(op)}` : "";
}
function applyFunction(fn) {
  let x = Number(current);
  if (!Number.isFinite(x)) return;

  if (btn.dataset.fn) {
  return applyFunction(btn.dataset.fn);
}


  let result;
  switch (fn) {
    case "sqrt":
      result = Math.sqrt(x);
      break;
    case "pow2":
      result = x * x;
      break;
    case "sin":
      result = Math.sin(x);
      break;
    case "cos":
      result = Math.cos(x);
      break;
    case "tan":
      result = Math.tan(x);
      break;
  }

  current = String(
    Math.round((result + Number.EPSILON) * 1e12) / 1e12
  );
  justEvaluated = true;
  update();
}

function prettyOp(o) {
  return ({"/":"÷","*":"×","-":"−","+":"+"})[o] ?? o;
}

function setCurrent(val) {
  current = val;
  update();
}

function inputNumber(n) {
  if (justEvaluated) {
    current = "0";
    justEvaluated = false;
  }
  if (current === "0") setCurrent(String(n));
  else setCurrent(current + String(n));
}

function inputDot() {
  if (justEvaluated) {
    current = "0";
    justEvaluated = false;
  }
  if (!current.includes(".")) setCurrent(current + ".");
}

function clearAll() {
  current = "0";
  prev = null;
  op = null;
  justEvaluated = false;
  update();
}

function del() {
  if (justEvaluated) return; // don't delete result
  if (current.length <= 1) setCurrent("0");
  else setCurrent(current.slice(0, -1));
}

function toggleSign() {
  if (current === "0") return;
  if (current.startsWith("-")) setCurrent(current.slice(1));
  else setCurrent("-" + current);
}

function compute(a, o, b) {
  const x = Number(a);
  const y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return "Error";
  if (o === "/" && y === 0) return "Error";
  const r =
    o === "+" ? x + y :
    o === "-" ? x - y :
    o === "*" ? x * y :
    o === "/" ? x / y : NaN;

  if (!Number.isFinite(r)) return "Error";

  // Clean floating point noise (e.g., 0.30000000004)
  const rounded = Math.round((r + Number.EPSILON) * 1e12) / 1e12;
  return String(rounded);
}

function chooseOp(nextOp) {
  if (op && prev !== null && !justEvaluated) {
    // chain operations: 2 + 3 + 4
    const res = compute(prev, op, current);
    prev = res === "Error" ? null : res;
    current = res === "Error" ? "0" : res;
  } else {
    prev = current;
  }
  op = nextOp;
  current = "0";
  justEvaluated = false;
  update();
}

function equals() {
  if (!op || prev === null) return;
  const res = compute(prev, op, current);
  historyEl.textContent = `${prev} ${prettyOp(op)} ${current} =`;
  op = null;
  prev = null;
  current = res === "Error" ? "Error" : res;
  justEvaluated = true;
  update();
}

keys.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.num) return inputNumber(btn.dataset.num);
  if (btn.dataset.op) return chooseOp(btn.dataset.op);

  switch (btn.dataset.action) {
    case "clear": return clearAll();
    case "delete": return del();
    case "dot": return inputDot();
    case "sign": return toggleSign();
    case "equals": return equals();
  }
});

document.addEventListener("keydown", (e) => {
  const k = e.key;

  if (k >= "0" && k <= "9") return inputNumber(k);
  if (k === ".") return inputDot();
  if (k === "Backspace") return del();
  if (k === "Escape") return clearAll();
  if (k === "Enter" || k === "=") return equals();
  if (["+", "-", "*", "/"].includes(k)) return chooseOp(k);
});
update();
