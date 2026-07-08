import { elements } from "@/ui/dom.js";
import { kpssService, kpssData } from "@/services/kpssService.js";

let currentSubject = "turkce";

export async function initKpss() {
  const container = elements.kpssTopicList();
  if (!container) {
    return;
  }

  // Subject buttons
  elements.kpssSubjectBtns().forEach((btn) => {
    btn.onclick = () => {
      elements.kpssSubjectBtns().forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentSubject = btn.dataset.subject || "turkce";
      renderKpssTopics();
    };
  });

  // Daily stats save button
  elements.kpssSaveStatsBtn()?.addEventListener("click", async () => {
    const questions = parseInt(elements.kpssQuestionsInput()?.value || "0");
    const subject = elements.kpssSubjectSelect()?.value || "turkce";

    if (questions > 0) {
      await kpssService.saveKpssDailyStats(questions, subject);
      if (elements.kpssQuestionsInput()) {
        elements.kpssQuestionsInput()!.value = "";
      }
      renderHistoryChart();
    }
  });

  elements.kpssResetStatsBtn()?.addEventListener("click", async () => {
    if (confirm("Tüm KPSS çalışma verileriniz silinecektir. Emin misiniz?")) {
      await kpssService.setKpssDailyStats([]);
      await renderHistoryChart();
    }
  });

  await renderKpssTopics();
  await renderHistoryChart();
}

async function renderHistoryChart() {
  const canvas = elements.kpssHistoryChart();
  const placeholder = elements.kpssChartPlaceholder();
  if (!canvas) {
    return;
  }

  const stats = await kpssService.getKpssDailyStats();
  const last7Days = stats.slice(-7);

  if (last7Days.length === 0) {
    placeholder?.classList.remove("hidden");
    canvas.style.display = "none";
    return;
  }

  placeholder?.classList.add("hidden");
  canvas.style.display = "block";

  // Ensure layout is settled
  requestAnimationFrame(() => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) {
      // If still 0, try one more time
      setTimeout(() => renderHistoryChart(), 50);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 35;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxQuestions = Math.max(...last7Days.map(s => s.questions), 10);

    ctx.clearRect(0, 0, width, height);

    // Draw background lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
       const y = padding + (chartHeight / 4) * i;
       ctx.beginPath();
       ctx.moveTo(padding, y);
       ctx.lineTo(width - padding, y);
       ctx.stroke();
    }

    const barGap = 15;
    const barWidth = (chartWidth - (barGap * (last7Days.length - 1))) / last7Days.length;

    last7Days.forEach((stat, i) => {
      const x = padding + i * (barWidth + barGap);
      const barHeight = (stat.questions / maxQuestions) * chartHeight;
      const y = height - padding - barHeight;

      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#8b5cf6';

      // Bar
      const gradient = ctx.createLinearGradient(x, y, x, height - padding);
      gradient.addColorStop(0, accentColor);
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
      
      ctx.fillStyle = gradient;
      
      const radius = 6;
      ctx.beginPath();
      if (barHeight > radius) {
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
      } else {
        ctx.rect(x, y, barWidth, Math.max(barHeight, 2));
      }
      ctx.fill();

      // Labels
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "500 10px Inter";
      ctx.textAlign = "center";
      const dateLabel = stat.date.split("-").slice(2).join("/") + "/" + stat.date.split("-")[1];
      ctx.fillText(dateLabel, x + barWidth / 2, height - padding + 18);
      
      ctx.fillStyle = "white";
      ctx.font = "bold 11px Inter";
      ctx.fillText(stat.questions.toString(), x + barWidth / 2, y - 8);
    });
  });
}

async function renderKpssTopics() {
  const container = elements.kpssTopicList();
  if (!container) {
    return;
  }

  const progressList = await kpssService.getKpssProgress();
  const topics = kpssData[currentSubject] || [];

  container.innerHTML = "";

  topics.forEach((topicData) => {
    const topic = topicData.title;
    const progress = progressList.find(
      (p) => p.subject === currentSubject && p.topic === topic,
    );
    const status = progress ? progress.status : 0;

    const item = document.createElement("div");
    item.className = "kpss-topic-item";
    item.setAttribute("data-status", status.toString());

    item.innerHTML = `
      <div class="kpss-status-indicator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span class="kpss-topic-name">${topic}</span>
      <button class="kpss-info-btn" title="Detay">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </button>
    `;

    item.onclick = async (e) => {
      // Don't toggle if the info button was clicked
      if ((e.target as HTMLElement).closest(".kpss-info-btn")) {
        return;
      }

      const currentStatus = parseInt(item.getAttribute("data-status") || "0");
      const nextStatus: 0 | 1 | 2 = ((currentStatus + 1) % 3) as 0 | 1 | 2;

      item.setAttribute("data-status", nextStatus.toString());
      await kpssService.updateTopicStatus(currentSubject, topic, nextStatus);
      updateProgress(topics.length);
    };

    item.querySelector(".kpss-info-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openDetailModal(topicData.title, topicData.description);
    });

    container.appendChild(item);
  });

  updateProgress(topics.length);
}

function openDetailModal(title: string, description: string) {
  const modal = elements.yeterlikModal();
  const mTitle = elements.yeterlikModalTitle();
  const mDesc = elements.yeterlikModalDescription();

  if (modal && mTitle && mDesc) {
    mTitle.textContent = title;
    mDesc.textContent = description;
    modal.classList.add("active");
  }
}

async function updateProgress(totalTopics: number) {
  const percentage = await kpssService.getSubjectProgressPercentage(currentSubject, totalTopics);

  const subjectNames: Record<string, string> = {
    turkce: "Türkçe",
    matematik: "Matematik",
    geometri: "Geometri",
    tarih: "Tarih",
    cografya: "Coğrafya",
    vatandaslik: "Vatandaşlık",
  };

  const titleEl = elements.kpssSubjectTitle();
  const textEl = elements.kpssProgressText();
  const fillEl = elements.kpssProgressFill();

  if (titleEl) {
    titleEl.textContent = subjectNames[currentSubject] || currentSubject;
  }
  if (textEl) {
    textEl.textContent = `%${percentage} tamamlandı`;
  }
  if (fillEl) {
    fillEl.style.width = `${percentage}%`;
  }
}
