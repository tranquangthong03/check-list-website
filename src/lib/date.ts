export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
