var EXTENSION_ID = chrome.i18n.getMessage("@@extension_id");
var BLOCKED_CLASS_NAME = EXTENSION_ID + "-blocked";
var OVERLAY_ID = EXTENSION_ID + "-overlay";

var blocked = false;

function buildControl(action) {
  var button = document.createElement("button");
  button.innerText = action; // TODO: i18n, update with phases
  button.addEventListener("click", function() {
    // Phases.trigger requires API permissions that we don't have, so ask the
    // router to do it for us.
    chrome.runtime.sendMessage({trigger: action});
  });
  return button;
}

function buildControls() {
  var wrapper = document.createElement("div");
  ["next", "exit"].map(buildControl).forEach(function(control) {
    wrapper.appendChild(control);
  });
  return wrapper;
}

function buildOverlay() {
  var overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  var messageKeys = ["site_blocked_info", "site_blocked_motivator"];
  messageKeys.forEach(function(key) {
    var p = document.createElement("p");
    p.innerText = chrome.i18n.getMessage(key);
    overlay.appendChild(p);
  });
  overlay.appendChild(buildControls());
  return overlay;
}

function block() {
  console.log("Blocked.");
  blocked = true;
  document.documentElement.classList.add(BLOCKED_CLASS_NAME);
  document.body.appendChild(buildOverlay());
}

function unblock() {
  console.log("Unblocked.");
  blocked = false;
  document.documentElement.classList.remove(BLOCKED_CLASS_NAME);
  document.body.removeChild(document.getElementById(OVERLAY_ID));
}

function toggleBlocked(phase) {
  console.log("Current phase:", phase);
  if (phase.blocked !== blocked) {
    // TODO: forward matcher with phase changes to avoid redundant lookups?
    SiteMatcher.getCurrent(function(matcher) {
      if (!matcher.allows(document.location.href)) {
        if (phase.blocked) {
          block();
        } else {
          unblock();
        }
      }
    });
  }
}

Phases.onChanged.addListener(function(phaseName) {
  toggleBlocked(Phases.get(phaseName));
});

Phases.getCurrent(toggleBlocked);
