var extensionId = chrome.i18n.getMessage("@@extension_id");
var blockedClassName = extensionId + "-blocked";
var overlayId = extensionId + "-overlay";

var blocked = false;

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
  console.log("Blocked.");
  blocked = true;
  document.documentElement.classList.add(blockedClassName);
  document.body.appendChild(buildOverlay());
}

function unblock() {
  console.log("Unblocked.");
  blocked = false;
  document.documentElement.classList.remove(blockedClassName);
  document.body.removeChild(document.getElementById(overlayId));
}

function toggleBlocked(phase) {
  console.log("Current phase:", phase);
  if (phase.blocked !== blocked) {
    SiteMatcher.getCurrent(function(matcher) {
      if (phase.blocked) {
        block();
      } else {
        unblock();
      }
    });
  }
}

Phases.onChanged.addListener(function(phaseName) {
  toggleBlocked(Phases.get(phaseName));
});

Phases.getCurrent(toggleBlocked);
