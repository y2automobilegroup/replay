/**
 * Vercel Serverless Function: /api/callback
 * LINE Messaging API Webhook endpoint
 *
 * Features:
 * - On follow: fetch user's displayName then send welcome text + Quick Reply buttons
 *
 * Required ENV:
 * - CHANNEL_ACCESS_TOKEN
 */

const LINE_REPLY_API = "https://api.line.me/v2/bot/message/reply";
const LINE_PROFILE_API = "https://api.line.me/v2/bot/profile/";

/** Build welcome message + Quick Reply (with displayName) */
function buildWelcomeWithQuickReply(displayName = "您好") {
  return {
    type: "text",
    text: `${displayName} 感謝您選擇亞鈺
我們「以極具溫度的服務，提供車種多元、車況透明且保固完善的購車體驗」 

📢 為什麼選擇亞鈺？ 
✅ 全台唯一購車五日鑑賞期，無理由包退換 
✅ 40多年專業經驗，成交上萬位車主，累積信任好評 
✅ 獨創保固系統，全台150間保修廠，AI智能線上回覆 
✅ 四大營業據點，專業團隊隨時為您服務 

🔹 亞鈺汽車最新車款： 
點擊觀看👉 https://reurl.cc/MMYKg3

誠摯邀請您使用下方按鈕及選單 或是 直接傳送訊息
專人將立即為您服務 🤝`,
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

/** Reply message helper */
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
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE reply failed: ${res.status} ${text}`);
  }
}

/** Fetch LINE user's displayName by userId */
async function getDisplayName(userId) {
  const token = process.env.CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("Missing env CHANNEL_ACCESS_TOKEN");
  if (!userId) return null;

  const res = await fetch(`${LINE_PROFILE_API}${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data?.displayName || null;
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

      // ✅ Only handle "follow" (new friend)
      if (event.type === "follow") {
        const userId = event?.source?.userId;
        const displayName = (await getDisplayName(userId)) || "您好";

        await replyMessage(replyToken, buildWelcomeWithQuickReply(displayName));
        continue;
      }

      // ✅ Other events: keep silent (no echo / no extra replies)
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    // Return 200 to avoid LINE retry storm
    return res.status(200).json({ ok: false, error: String(err?.message || err) });
  }
}
