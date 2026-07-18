export function calculateKpssCountdown(targetDate: number, now: number, lang: string): string {
  const diffKpss = targetDate - now;
  if (diffKpss <= 0) {
    return lang === "tr" ? "Sınav Başladı!" : "Exam Started!";
  }
  const days = Math.floor(diffKpss / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffKpss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffKpss % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffKpss % (1000 * 60)) / 1000);
  return lang === "tr"
    ? `${days} Gün, ${hours} Saat, ${mins} Dk, ${secs} Sn`
    : `${days}d, ${hours}h, ${mins}m, ${secs}s`;
}

export function calculateEstimatedCompletionTime(remainingCount: number, now: number, lang: string): string {
  if (remainingCount === 0) {
    return lang === "tr" ? "Tebrikler, bitti!" : "Completed!";
  }
  const estimatedRemainingDays = remainingCount * 2;
  const estimatedTargetDate = now + estimatedRemainingDays * 24 * 60 * 60 * 1000;
  const diffEst = estimatedTargetDate - now;

  const days = Math.floor(diffEst / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffEst % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffEst % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffEst % (1000 * 60)) / 1000);
  return lang === "tr"
    ? `${days} Gün, ${hours} Saat, ${mins} Dk, ${secs} Sn`
    : `${days}d, ${hours}h, ${mins}m, ${secs}s`;
}
