export interface Notification {
  id: string;
  message: string;
  time: number;
  read: boolean;
}

export function saveNotification(message: string) {
  const stored: Notification[] = JSON.parse(
    localStorage.getItem("majdoor_notifications") || "[]",
  );
  stored.unshift({
    id: Date.now().toString(),
    message,
    time: Date.now(),
    read: false,
  });
  if (stored.length > 20) stored.pop();
  localStorage.setItem("majdoor_notifications", JSON.stringify(stored));
  window.dispatchEvent(new Event("majdoor_notification"));
}

export function getNotifications(): Notification[] {
  return JSON.parse(localStorage.getItem("majdoor_notifications") || "[]");
}

export function markAllRead() {
  const stored = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem("majdoor_notifications", JSON.stringify(stored));
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}
