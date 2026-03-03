function buildQuickReplyMenu() {
  return {
    type: "flex",
    altText: "選擇服務",  // 通知欄顯示的文字，可改成「歡迎使用下方選單」
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: " ",  // 還是需要，但高度設極小
            size: "xxs",  // 最小字體
            color: "#ffffff",  // 白色（或透明色 #00000000 如果支援）
            margin: "none"
          }
        ],
        paddingAll: "0px",
        paddingTop: "0px",
        paddingBottom: "0px"
      },
      styles: {
        body: {
          backgroundColor: "#ffffff00"  // 完全透明背景
        }
      }
    },
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
