import { storage } from "@/core/storage.js";
import { elements } from "@/ui/dom.js";
import { state } from "@/core/state.js";

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

  elements.dayTasksClose().addEventListener("click", () => {
    elements.dayTasksModal().classList.remove("active");
  });

  window.addEventListener("click", (e) => {
    if (e.target === elements.dayTasksModal()) {
      elements.dayTasksModal().classList.remove("active");
    }
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
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthName =
    state.currentLang === "tr" ? monthNamesTr[month] : monthNamesEn[month];
  currentMonthYear.textContent = `${monthName} ${year}`;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startOffset; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day empty";
    calendarGrid.appendChild(emptyCell);
  }

  const completedTasksByDate: Record<string, string[]> = {};

  todos.forEach((todo) => {
    const dates = todo.completedDates || (todo.lastCompletedDate ? [todo.lastCompletedDate] : []);
    dates.forEach((dateStr) => {
      const date = new Date(dateStr);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!completedTasksByDate[dateKey]) {
        completedTasksByDate[dateKey] = [];
      }
      if (!completedTasksByDate[dateKey].includes(todo.text)) {
        completedTasksByDate[dateKey].push(todo.text);
      }
    });
  });

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

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
    const tasks = completedTasksByDate[dateKey] || [];

    if (tasks.length > 0) {
      const taskList = document.createElement("ul");
      taskList.className = "calendar-task-list";
      tasks.forEach((taskText) => {
        const taskItem = document.createElement("li");
        taskItem.textContent = taskText;
        taskList.appendChild(taskItem);
      });
      dayCell.appendChild(taskList);
      dayCell.classList.add("has-tasks");
    }

    dayCell.addEventListener("click", () => {
      showDayTasks(day, monthName, year, tasks);
    });

    calendarGrid.appendChild(dayCell);
  }
}

function showDayTasks(day: number, monthName: string, year: number, tasks: string[]) {
  elements.dayTasksTitle().textContent = `${day} ${monthName} ${year}`;
  const list = elements.dayTasksList();
  list.innerHTML = "";

  if (tasks.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = state.currentLang === "tr" ? "Bu güne ait tamamlanmış görev yok." : "No completed tasks for this day.";
    emptyMsg.style.color = "var(--text-secondary)";
    emptyMsg.style.textAlign = "center";
    emptyMsg.style.padding = "20px";
    list.appendChild(emptyMsg);
  } else {
    tasks.forEach(taskText => {
      const li = document.createElement("li");
      li.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${taskText}</span>
      `;
      list.appendChild(li);
    });
  }

  elements.dayTasksModal().classList.add("active");
}
