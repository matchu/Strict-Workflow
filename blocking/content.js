var extensionId = chrome.i18n.getMessage("@@extension_id");
var blockedClassName = extensionId + "-blocked";
var overlayId = extensionId + "-overlay";

function buildOverlay() {
  var overlay = document.createElement("div");
  overlay.id = overlayId;
  var messageKeys = ["site_blocked_info", "site_blocked_motivator"];
  messageKeys.forEach(function(key) {
    var p = document.createElement("p");
    p.innerText = chrome.i18n.getMessage(key);
    overlay.appendChild(p);
  });
  return overlay;
}

function block() {
  document.documentElement.classList.add(blockedClassName);
  document.body.appendChild(buildOverlay());
}

function unblock() {
  document.documentElement.classList.remove(blockedClassName);
  document.body.removeChild(document.getElementById(overlayId));
}

chrome.runtime.onMessage.addListener(function(message) {
  if ("blocked" in message) {
    if (message.blocked) {
      block();
    } else {
      unblock();
    }
  }
});
