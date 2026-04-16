import { elements } from "./dom.js";

let timer: number | null = null;
let timeLeft = 25 * 60;
let isWork = true;
let currentMode: 'focus' | 'short' | 'long' = 'focus';

const MODE_TIMES = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

const MODE_LABELS = {
    focus: "FOCUS",
    short: "SHORT BREAK",
    long: "LONG BREAK"
};

export function initPomodoro() {
    const startBtn = elements.pomodoroStart();
    const pauseBtn = elements.pomodoroPause();
    const resetBtn = elements.pomodoroReset();
    const modeBtns = elements.pomodoroModeBtns();

    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", resetTimer);

    modeBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const mode = (e.currentTarget as HTMLButtonElement).dataset.mode as any;
            setMode(mode);
        });
    });

    updateDisplay();
}

function setMode(mode: 'focus' | 'short' | 'long') {
    pauseTimer();
    currentMode = mode;
    timeLeft = MODE_TIMES[mode];
    
    elements.pomodoroModeBtns().forEach(btn => {
        const b = btn as HTMLButtonElement;
        b.classList.toggle("active", b.dataset.mode === mode);
    });
    
    elements.pomodoroLabel().textContent = MODE_LABELS[mode];
    updateDisplay();
}

function startTimer() {
    if (timer) return;
    
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
    updateDisplay();
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    elements.pomodoroTime().textContent = timeStr;
    
    // Also update document title if tab is focused on pomodoro? 
    // Maybe unnecessary for a new tab but useful.
}

function handleTimerComplete() {
    if (currentMode === 'focus') {
        setMode('short');
    } else {
        setMode('focus');
    }
}

function notify() {
    // Basic vibration or sound if possible
    try {
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audio.play();
    } catch (e) {
        console.warn("Could not play sound", e);
    }
    
    if (Notification.permission === "granted") {
        new Notification("ZenTodo Pomodoro", {
            body: currentMode === 'focus' ? "Focus session complete! Take a break." : "Break over! Time to focus."
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}
