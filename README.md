# LINE Messaging API Webhook（Vercel 版 / Node.js）- Quick Reply 按鈕

## 你會得到什麼？
- 使用者「加好友」(follow) → 回一則歡迎訊息 + 4 顆 Quick Reply（按下去會送出訊息）
- 使用者「點按鈕/傳文字」→ webhook 會收到文字，再回覆「您選擇了：xxx」

## 1) 上傳到 GitHub
1. 解壓縮本專案
2. 建立 GitHub repo
3. 把整個資料夾 push 上去

## 2) Vercel 部署
1. 登入 Vercel
2. Add New → Project → Import Git Repository
3. Deploy

## 3) 設定環境變數（超重要）
Vercel 專案 → Settings → Environment Variables
- `CHANNEL_ACCESS_TOKEN`：你的 LINE Channel access token（long-lived）

新增後請 **Redeploy** 一次。

## 4) LINE Developers 設定 Webhook URL
在 LINE Developers → Messaging API：
- Webhook URL 填：
  `https://你的vercel網域/api/callback`
- 打開 `Use webhook`
- 按 `Verify` 測試

## 5) 按鈕文字要改哪裡？
在 `api/callback.js` 裡的 `buildQuickReplyWelcome()`：
- `label`：顯示在按鈕上的文字
- `text`：按下後會送出的訊息文字（也會回到 webhook）

---
若你要串 GPT / Supabase：
把 `message` 事件那段的回覆改成你的查詢/生成結果即可。
