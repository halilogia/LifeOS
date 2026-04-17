import { elements } from "../ui/dom.js";

let timer: number | null = null;
let timeLeft = 25 * 60;
let totalTime = 25 * 60;
let currentMode: "focus" | "short" | "long" = "focus";

const MODE_TIMES = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const MODE_LABELS = {
  focus: "FOCUS",
  short: "SHORT BREAK",
  long: "LONG BREAK",
};

const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 150; // r=150 from HTML

export function initPomodoro() {
  const startBtn = elements.pomodoroStart();
  const pauseBtn = elements.pomodoroPause();
  const resetBtn = elements.pomodoroReset();
  const modeBtns = elements.pomodoroModeBtns();

  // Remove existing to avoid double listeners if re-init
  startBtn.replaceWith(startBtn.cloneNode(true));
  pauseBtn.replaceWith(pauseBtn.cloneNode(true));
  resetBtn.replaceWith(resetBtn.cloneNode(true));

  elements.pomodoroStart().addEventListener("click", startTimer);
  elements.pomodoroPause().addEventListener("click", pauseTimer);
  elements.pomodoroReset().addEventListener("click", resetTimer);

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const mode = (e.currentTarget as HTMLButtonElement).dataset
        .mode as unknown;
      setMode(mode as "focus" | "short" | "long");
    });
  });

  updateDisplay();
}

function setMode(mode: "focus" | "short" | "long") {
  pauseTimer();
  currentMode = mode;
  timeLeft = MODE_TIMES[mode];
  totalTime = timeLeft;

  elements.pomodoroModeBtns().forEach((btn) => {
    const b = btn as HTMLButtonElement;
    b.classList.toggle("active", b.dataset.mode === mode);
  });

  const label = elements.pomodoroLabel();
  if (label) {
    label.textContent = MODE_LABELS[mode];
  }
  updateDisplay();
}

function startTimer() {
  if (timer) {
    return;
  }

  elements.pomodoroStart().classList.add("hidden");
  elements.pomodoroPause().classList.remove("hidden");

  timer = window.setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timer!);
      timer = null;
      notify();
      handleTimerComplete();
    }
    updateDisplay();
  }, 1000);
}

function pauseTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  elements.pomodoroStart().classList.remove("hidden");
  elements.pomodoroPause().classList.add("hidden");
}

function resetTimer() {
  pauseTimer();
  timeLeft = MODE_TIMES[currentMode];
  totalTime = timeLeft;
  updateDisplay();
}

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const timeEl = elements.pomodoroTime();
  if (timeEl) {
    timeEl.textContent = timeStr;
  }

  // Update progress ring
  const progressEl = document.getElementById("pomodoro-progress") as unknown;
  if (progressEl) {
    const percent = timeLeft / totalTime;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - percent);
    (progressEl as SVGElement).style.strokeDashoffset = offset.toString();
  }
}

function handleTimerComplete() {
  if (currentMode === "focus") {
    setMode("short");
  } else {
    setMode("focus");
  }
}

function notify() {
  // Better alarm sound
  try {
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    );
    audio.volume = 0.4;
    audio.play();
  } catch (e) {
    console.warn("Could not play sound", e);
  }

  if (Notification.permission === "granted") {
    new Notification("Life OS", {
      body:
        currentMode === "focus"
          ? "Session finished! Take a break."
          : "Break over! Time to focus.",
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}
