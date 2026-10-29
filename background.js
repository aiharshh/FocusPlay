
const RULE_ID = 1;

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: "Referer",
              operation: "set",
              value: chrome.runtime.id,
            }
          ]
        },
        condition: {
          initiatorDomains: [chrome.runtime.id],
          requestDomains: ["www.youtube.com"],
          resourceTypes: ["sub_frame"]
        }
      }
    ]
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url) return;

  let url;

  try {
    url = new URL(tab.url);
  } catch {
    return;
  }

  if (
    url.hostname !== "www.youtube.com" &&
    url.hostname !== "youtube.com" &&
    url.hostname !== "m.youtube.com"
  ) {
    chrome.action.setBadgeText({
      text: "!",
      tabId: tab.id
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#d97706",
      tabId: tab.id
    });
    return;
  }

  if (url.pathname !== "/watch") return;

  const videoId = url.searchParams.get("v");
  if (!videoId) return;

  chrome.action.setBadgeText({
    text: "",
    tabId: tab.id
  });

  const start = url.searchParams.get("t")
    || url.searchParams.get("start")
    || "0";

  const playerUrl = new URL(
    chrome.runtime.getURL("player.html")
  );

  playerUrl.searchParams.set("video", videoId);
  playerUrl.searchParams.set("start", start);

  chrome.tabs.create({
    url: playerUrl.href
  });
});
