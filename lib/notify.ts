export async function sendOwnerNotification(
  text: string,
): Promise<{ sent: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[notify] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID missing — owner notification skipped.",
    );
    return { sent: false, error: "not_configured" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[notify] Telegram error:", res.status, body.slice(0, 200));
      return { sent: false, error: `http_${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[notify] Telegram send failed:", err);
    return { sent: false, error: "send_failed" };
  }
}
