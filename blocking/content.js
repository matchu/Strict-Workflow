var EXTENSION_ID = chrome.i18n.getMessage("@@extension_id");
var BLOCKED_CLASS_NAME = EXTENSION_ID + "-blocked";

var blocked = false;
var overlay, controls;

function buildControl(action) {
  var button = document.createElement("button");
  button.addEventListener("click", function() {
    // Phases.trigger requires API permissions that we don't have, so ask the
    // router to do it for us.
    chrome.runtime.sendMessage({trigger: action});
  });
  return button;
}

function buildControls(phase) {
  var wrapper = document.createElement("div");

  if (phase.on.next) {
    var nextButton = buildControl("next");
    nextButton.innerText = chrome.i18n.getMessage("start_next_" + phase.on.next);
    wrapper.appendChild(nextButton);
  }

  if (phase.on.exit) {
    var exitButton = buildControl("exit");
    exitButton.innerText = chrome.i18n.getMessage("exit");
    wrapper.appendChild(exitButton);
  }

  return wrapper;
}

function buildOverlay() {
  var overlay = document.createElement("div");
  overlay.id = EXTENSION_ID + "-overlay";
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
  document.documentElement.classList.add(BLOCKED_CLASS_NAME);
  if (!overlay) {
    overlay = buildOverlay();
  }
  document.body.appendChild(overlay);
}

function unblock() {
  console.log("Unblocked.");
  blocked = false;
  document.documentElement.classList.remove(BLOCKED_CLASS_NAME);
  document.body.removeChild(overlay);
}

function updateOverlay(phase) {
  if (blocked) {
    console.log("OMG we're blocked! Update overlay!", phase, phase.on.next);
    if (controls) overlay.removeChild(controls);
    controls = buildControls(phase);
    overlay.appendChild(controls);
  }
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
      updateOverlay(phase);
    });
  } else {
    updateOverlay(phase);
  }
}

Phases.onChanged.addListener(function(phaseName) {
  toggleBlocked(Phases.get(phaseName));
});

Phases.getCurrent(toggleBlocked);
