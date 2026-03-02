/**
 * Vercel Serverless Function: /api/callback
 * LINE Messaging API Webhook endpoint
 *
 * Features:
 * - On follow: send welcome + Quick Reply buttons (message actions)
 * - On message: echo the user's text (you can replace this with GPT/Supabase logic)
 *
 * Required ENV:
 * - CHANNEL_ACCESS_TOKEN
 */

const LINE_REPLY_API = "https://api.line.me/v2/bot/message/reply";

function buildQuickReplyWelcome() {
  return {
    type: "text",
    text: "歡迎加入官方LINE，請選擇服務：",
    quickReply: {
      items: [
        {
          type: "action",
          action: { type: "message", label: "我要購車！", text: "我要購車" }
        },
        {
          type: "action",
          action: { type: "message", label: "愛車估價？", text: "我要估價" }
        },
        {
          type: "action",
          action: { type: "message", label: "想了解皮卡系列？", text: "我想了解皮卡系列" }
        },
        {
          type: "action",
          action: { type: "message", label: "專人服務！", text: "我要專人服務" }
        }
      ]
    }
  };
}

async function replyMessage(replyToken, messages) {
  const token = process.env.CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("HQmkX5VZCD9LjRJC5+YlP7D7J6jFQ4Oz/xPbJG236mK91F/HxrLD67ltFdouN4xgus00hV1YAn4QQ5TBbOVDLEAnybANmfTJD9/Rrf1zkx/2IWq8B3pwENTX55n5w079/9SSBuyzBKtlx+WV5znLIgdB04t89/1O/w1cDnyilFU=N");
  }

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

  // LINE returns 200 even if it fails sometimes; still parse for debugging
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`LINE reply failed: ${res.status} ${text}`);
  }
  return text;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(200).send("OK");
    return;
  }

  try {
    const body = req.body || {};
    const events = body.events || [];

    // LINE may send multiple events in one request
    for (const event of events) {
      const replyToken = event.replyToken;

      if (!replyToken) continue;

      if (event.type === "follow") {
        await replyMessage(replyToken, buildQuickReplyWelcome());
        continue;
      }

      if (event.type === "message" && event.message?.type === "text") {
        const userText = event.message.text || "";
        await replyMessage(replyToken, {
          type: "text",
          text: `您選擇了：${userText}`
        });
        continue;
      }

      // For other event types, keep silent or reply as needed
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    // Return 200 to LINE to avoid retries storm; log for Vercel
    console.error(err);
    res.status(200).json({ ok: false, error: String(err?.message || err) });
  }
}
