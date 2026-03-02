/**
 * Vercel Serverless Function: /api/callback
 * LINE Messaging API Webhook endpoint
 *
 * Required ENV:
 * - CHANNEL_ACCESS_TOKEN
 */

const LINE_REPLY_API = "https://api.line.me/v2/bot/message/reply";

function buildQuickReplyWelcome() {
  return {
    type: "text",
    text: " ", // 想完全不顯示可改成 " "
    quickReply: {
      items: [
        { type: "action", action: { type: "message", label: "我要購車！", text: "我要購車" } },
        { type: "action", action: { type: "message", label: "愛車估價？", text: "我要估價" } },
        { type: "action", action: { type: "message", label: "想了解皮卡系列？", text: "我想了解皮卡系列" } },
        { type: "action", action: { type: "message", label: "專人服務！", text: "我要專人服務" } }
      ]
    }
  };
}

async function replyMessage(replyToken, messages) {
  const token = process.env.CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("Missing env CHANNEL_ACCESS_TOKEN");

  const body = {
    replyToken,
    messages: Array.isArray(messages) ? messages : [messages]
  };

  const res = await fetch(LINE_REPLY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE reply failed: ${res.status} ${text}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  try {
    const events = req.body?.events || [];

    for (const event of events) {
      const replyToken = event.replyToken;
      if (!replyToken) continue;

      // 1) 加好友 → 顯示一次按鈕
      if (event.type === "follow") {
        await replyMessage(replyToken, buildQuickReplyWelcome());
        continue;
      }

      // 2) 使用者傳任何文字 / 按按鈕（按鈕也會送出文字）→ 再顯示一次按鈕
      if (event.type === "message" && event.message?.type === "text") {
        await replyMessage(replyToken, buildQuickReplyWelcome());
        continue;
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ ok: false });
  }
}
