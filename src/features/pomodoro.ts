// Main Pomodoro State
let pomoTimer: number | null = null;
let pomoTimeLeft = 25 * 60;
let pomoTotalTime = 25 * 60;
let pomoMode: "focus" | "short" | "long" = "focus";

// Stopwatch State
let swTimer: number | null = null;
let swTime = 0;

// Alarm State
let alarmTimer: number | null = null;
let alarmTarget: string | null = null;

const MODE_TIMES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const MODE_LABELS = { focus: "FOCUS", short: "SHORT", long: "LONG" };
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 110; // updated r=110

export function initPomodoro() {
  initPomoListeners();
  initSwListeners();
  initAlarmListeners();
  updateDisplays();
}

function initPomoListeners() {
  const startBtn = document.getElementById("pomodoro-start");
  const pauseBtn = document.getElementById("pomodoro-pause");
  const resetBtn = document.getElementById("pomodoro-reset");
  const modeBtns = document.querySelectorAll(".pomodoro-mode-btn");

  startBtn?.addEventListener("click", startPomo);
  pauseBtn?.addEventListener("click", pausePomo);
  resetBtn?.addEventListener("click", resetPomo);

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      modeBtns.forEach((b) => b.classList.remove("active"));
      const target = e.currentTarget as HTMLButtonElement;
      target.classList.add("active");
      setPomoMode(target.dataset.mode as "focus" | "short" | "long");
    });
  });
}

function initSwListeners() {
  document.getElementById("sw-start-btn")?.addEventListener("click", startSw);
  document.getElementById("sw-pause-btn")?.addEventListener("click", pauseSw);
  document.getElementById("sw-reset-btn")?.addEventListener("click", resetSw);
}

function initAlarmListeners() {
  document
    .getElementById("alarm-start-btn")
    ?.addEventListener("click", startAlarm);
  document
    .getElementById("alarm-stop-btn")
    ?.addEventListener("click", stopAlarm);
}

// --- MAIN POMODORO ---
function setPomoMode(mode: "focus" | "short" | "long") {
  pausePomo();
  pomoMode = mode;
  pomoTimeLeft = MODE_TIMES[mode];
  pomoTotalTime = pomoTimeLeft;
  const label = document.getElementById("pomodoro-label");
  if (label) {
    label.textContent = MODE_LABELS[mode];
  }
  updatePomoDisplay();
}

function startPomo() {
  if (pomoTimer) {
    return;
  }
  document.getElementById("pomodoro-start")?.classList.add("hidden");
  document.getElementById("pomodoro-pause")?.classList.remove("hidden");
  pomoTimer = window.setInterval(() => {
    pomoTimeLeft--;
    if (pomoTimeLeft <= 0) {
      pausePomo();
      notify("Pomodoro finished!");
      // Auto switch?
      if (pomoMode === "focus") {
        setPomoMode("short");
      } else {
        setPomoMode("focus");
      }
    }
    updatePomoDisplay();
  }, 1000);
}

function pausePomo() {
  if (pomoTimer) {
    clearInterval(pomoTimer);
    pomoTimer = null;
  }
  document.getElementById("pomodoro-start")?.classList.remove("hidden");
  document.getElementById("pomodoro-pause")?.classList.add("hidden");
}

function resetPomo() {
  pausePomo();
  pomoTimeLeft = MODE_TIMES[pomoMode];
  pomoTotalTime = pomoTimeLeft;
  updatePomoDisplay();
}

function updatePomoDisplay() {
  const timeEl = document.getElementById("pomodoro-time");
  if (!timeEl) {
    return;
  }
  const mins = Math.floor(pomoTimeLeft / 60);
  const secs = pomoTimeLeft % 60;
  timeEl.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  const progressEl = document.getElementById("pomodoro-progress");
  if (progressEl) {
    const percent = pomoTimeLeft / pomoTotalTime;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - percent);
    (progressEl as HTMLElement).style.strokeDashoffset = offset.toString();
  }
}

// --- STOPWATCH ---
function startSw() {
  if (swTimer) {
    return;
  }
  document.getElementById("sw-start-btn")?.classList.add("hidden");
  document.getElementById("sw-pause-btn")?.classList.remove("hidden");
  swTimer = window.setInterval(() => {
    swTime++;
    updateSwDisplay();
  }, 1000);
}

function pauseSw() {
  if (swTimer) {
    clearInterval(swTimer);
    swTimer = null;
  }
  document.getElementById("sw-start-btn")?.classList.remove("hidden");
  document.getElementById("sw-pause-btn")?.classList.add("hidden");
}

function resetSw() {
  pauseSw();
  swTime = 0;
  updateSwDisplay();
}

function updateSwDisplay() {
  const timeEl = document.getElementById("stopwatch-time");
  if (!timeEl) {
    return;
  }
  const mins = Math.floor(swTime / 60);
  const secs = swTime % 60;
  timeEl.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// --- ALARM ---
function startAlarm() {
  const input = document.getElementById("alarm-time-input") as HTMLInputElement;
  if (!input || !input.value) {
    return;
  }
  alarmTarget = input.value;
  document.getElementById("alarm-start-btn")?.classList.add("hidden");
  document.getElementById("alarm-stop-btn")?.classList.remove("hidden");

  if (alarmTimer) {
    clearInterval(alarmTimer);
  }
  alarmTimer = window.setInterval(() => {
    const now = new Date().toTimeString().slice(0, 5);
    if (now === alarmTarget) {
      stopAlarm();
      notify("ALARM!");
    }
  }, 1000);
}

function stopAlarm() {
  if (alarmTimer) {
    clearInterval(alarmTimer);
    alarmTimer = null;
  }
  alarmTarget = null;
  document.getElementById("alarm-start-btn")?.classList.remove("hidden");
  document.getElementById("alarm-stop-btn")?.classList.add("hidden");
}

// --- UTILS ---
function updateDisplays() {
  updatePomoDisplay();
  updateSwDisplay();
}

function notify(msg: string) {
  try {
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    );
    audio.volume = 0.4;
    audio.play();
  } catch {
    /* empty */
  }
  if (Notification.permission === "granted") {
    new Notification("Life OS", { body: msg });
  } else {
    Notification.requestPermission();
  }
}
