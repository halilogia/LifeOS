import { storage } from "../core/storage.js";
import { elements } from "../ui/dom.js";
import { state } from "../core/state.js";

const currentDisplayDate = new Date();

export async function initCalendar() {
  renderCalendar();

  elements.prevMonthBtn().addEventListener("click", () => {
    currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
    renderCalendar();
  });

  elements.nextMonthBtn().addEventListener("click", () => {
    currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
    renderCalendar();
  });
}

export async function renderCalendar() {
  const todos = await storage.getTodos();
  const calendarGrid = elements.calendarGrid();
  const currentMonthYear = elements.currentMonthYear();

  calendarGrid.innerHTML = "";

  const year = currentDisplayDate.getFullYear();
  const month = currentDisplayDate.getMonth();

  const monthNamesTr = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  const monthNamesEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthName =
    state.currentLang === "tr" ? monthNamesTr[month] : monthNamesEn[month];
  currentMonthYear.textContent = `${monthName} ${year}`;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust to start from Monday (0: Sun, 1: Mon...) -> (0: Mon, 1: Tue...)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add empty cells for previous month
  for (let i = 0; i < startOffset; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day empty";
    calendarGrid.appendChild(emptyCell);
  }

  // Create lookup for completed tasks by date
  const completedTasksByDate: Record<string, string[]> = {};

  todos.forEach((todo) => {
    const dates =
      todo.completedDates ||
      (todo.lastCompletedDate ? [todo.lastCompletedDate] : []);
    dates.forEach((dateStr) => {
      const date = new Date(dateStr);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!completedTasksByDate[dateKey]) {
        completedTasksByDate[dateKey] = [];
      }
      // Avoid duplicate texts on the same day if desired, but here we just push
      if (!completedTasksByDate[dateKey].includes(todo.text)) {
        completedTasksByDate[dateKey].push(todo.text);
      }
    });
  });

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-day";
    if (isCurrentMonth && today.getDate() === day) {
      dayCell.classList.add("today");
    }

    const dayNumber = document.createElement("span");
    dayNumber.className = "day-number";
    dayNumber.textContent = day.toString();
    dayCell.appendChild(dayNumber);

    const dateKey = `${year}-${month}-${day}`;
    if (completedTasksByDate[dateKey]) {
      const taskList = document.createElement("ul");
      taskList.className = "calendar-task-list";
      completedTasksByDate[dateKey].forEach((taskText) => {
        const taskItem = document.createElement("li");
        taskItem.textContent = taskText;
        taskList.appendChild(taskItem);
      });
      dayCell.appendChild(taskList);
      dayCell.classList.add("has-tasks");
    }

    calendarGrid.appendChild(dayCell);
  }
}
