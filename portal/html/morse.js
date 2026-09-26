const CODE = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....",
  6: "-....", 7: "--...", 8: "---..", 9: "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "/": "-..-.", "@": ".--.-.",
};

const REVERSE = Object.fromEntries(Object.entries(CODE).map(([letter, marks]) => [marks, letter]));

const plain = document.querySelector("#plain");
const coded = document.querySelector("#coded");
const codedIn = document.querySelector("#coded-in");
const decoded = document.querySelector("#decoded");
const lamp = document.querySelector("#lamp");
const wpm = document.querySelector("#wpm");
const wpmLabel = document.querySelector("#wpm-label");
const playButton = document.querySelector("#play");
const stopButton = document.querySelector("#stop");

let stopRequested = false;
let audioContext;

function unitMs() {
  return 1200 / Number(wpm.value);
}

function encode(text) {
  return text.toUpperCase().split(/\s+/).filter(Boolean).map((word) => {
    return word.split("").map((letter) => CODE[letter] || "").filter(Boolean).join(" ");
  }).join(" / ");
}

function decode(text) {
  return text.trim().split("/").map((word) => {
    return word.trim().split(/\s+/).map((marks) => REVERSE[marks] || "?").join("");
  }).join(" ");
}

function render() {
  coded.textContent = encode(plain.value);
  decoded.textContent = decode(codedIn.value);
  wpmLabel.textContent = `${wpm.value} words per minute`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tone(on, ms) {
  if (stopRequested) return;
  lamp.classList.toggle("on", on);
  if (on && audioContext) {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = 600;
    oscillator.type = "sine";
    gain.gain.value = 0.08;
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    await sleep(ms);
    oscillator.stop();
  } else {
    await sleep(ms);
  }
  lamp.classList.remove("on");
}

async function play() {
  stopRequested = false;
  playButton.disabled = true;
  audioContext = audioContext || new AudioContext();
  if (audioContext.state === "suspended") await audioContext.resume();
  const marks = encode(plain.value);
  const unit = unitMs();
  for (const word of marks.split(" / ")) {
    if (stopRequested) break;
    const letters = word.split(" ").filter(Boolean);
    for (let i = 0; i < letters.length; i += 1) {
      const letter = letters[i];
      for (let j = 0; j < letter.length; j += 1) {
        if (stopRequested) break;
        await tone(true, letter[j] === "-" ? unit * 3 : unit);
        if (j < letter.length - 1) await tone(false, unit);
      }
      if (i < letters.length - 1) await tone(false, unit * 3);
    }
    await tone(false, unit * 7);
  }
  lamp.classList.remove("on");
  playButton.disabled = false;
}

plain.addEventListener("input", render);
codedIn.addEventListener("input", render);
wpm.addEventListener("input", render);
playButton.addEventListener("click", () => { play(); });
stopButton.addEventListener("click", () => {
  stopRequested = true;
  lamp.classList.remove("on");
  playButton.disabled = false;
});
render();
