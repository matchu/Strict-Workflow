/*
  Localization
*/

// Localize all elements with a data-i18n="message_name" attribute
var localizedElements = document.querySelectorAll('[data-i18n]'), el, message;
for(var i = 0; i < localizedElements.length; i++) {
  el = localizedElements[i];
  message = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
  
  // Capitalize first letter if element has attribute data-i18n-caps
  if(el.hasAttribute('data-i18n-caps')) {
    message = message.charAt(0).toUpperCase() + message.substr(1);
  }
  
  el.innerHTML = message;
}

/*
  Form interaction
*/

var FORM = {
  "root": document.getElementById("options-form"),
  "siteList": {
    "type": document.getElementById("site-list-type"),
    "sites": document.getElementById("site-list-sites")
  },
  "durations": {
    "work": document.getElementById("work-duration"),
    "break": document.getElementById("break-duration")
  },
  "notifications": document.getElementById("notifications"),
  "audio": document.getElementById("audio"),
  "saveSuccess": document.getElementById("save-successful"),
  "timeFormatError": document.getElementById("time-format-error")
}

var DURATION_FORMAT = /^([0-9]+)(:([0-9]{2}))?$/;
var INVALID_DURATION_ERROR = {};

function parseDuration(durationStr) {
  var match = durationStr.match(DURATION_FORMAT);
  if(match) {
    var duration = (60 * parseInt(match[1], 10));
    if(match[3]) {
      duration += parseInt(match[3], 10);
    }
    return duration * 1000;
  } else {
    throw INVALID_DURATION_ERROR;
  } 
}

function formatDuration(durationInMilliseconds) {
  var durationInSeconds = durationInMilliseconds / 1000;
  var seconds = durationInSeconds % 60;
  var minutes = (durationInSeconds - seconds) / 60;
  if(seconds >= 10) {
    return minutes + ":" + seconds;
  } else if(seconds > 0) {
    return minutes + ":0" + seconds;
  } else {
    return minutes;
  }
}

FORM.root.addEventListener("submit", function(e) {
  e.preventDefault();
  try {
    Options.set({
      "siteList": {
        "type": FORM.siteList.type.value,
        "sites": FORM.siteList.sites.value.split(/\r?\n/)
      },
      "durations": {
        "work": parseDuration(FORM.durations["work"].value),
        "break": parseDuration(FORM.durations["break"].value)
      },
      "notifications": FORM.notifications.checked,
      "audio": FORM.notifications.checked
    }, function() {
      if (!chrome.runtime.lastError) {
        FORM.saveSuccess.classList.add("show");
      } else {
        alert("Error saving: " + chrome.runtime.lastError.message);
      }
    });
  } catch (e) {
    if (e != INVALID_DURATION_ERROR) throw e;
    FORM.timeFormatError.classList.add("show");
  }
});

function formChanged() {
  FORM.saveSuccess.classList.remove("show");
  FORM.timeFormatError.classList.remove("show");
}

FORM.siteList.type.addEventListener("change", formChanged);
FORM.siteList.sites.addEventListener("focus", formChanged);
FORM.durations["work"].addEventListener("focus", formChanged);
FORM.durations["break"].addEventListener("focus", formChanged);
FORM.notifications.addEventListener("change", formChanged);
FORM.audio.addEventListener("change", formChanged);

Options.get(
  ["siteList", "durations", "notifications", "audio"],
  function(items) {
    FORM.siteList.type.value = items.siteList.type;
    FORM.siteList.sites.value = items.siteList.sites.join("\n");
    FORM.durations["work"].value = formatDuration(items.durations["work"]);
    FORM.durations["break"].value = formatDuration(items.durations["break"]);
    FORM.notifications.checked = items.notifications;
    FORM.audio.checked = items.audio;
  }
);

function toggleBlocked(phase) {
  document.body.classList.toggle("work", phase.blocked);
  FORM.siteList.type.disabled = phase.blocked;
  FORM.siteList.sites.disabled = phase.blocked;
  FORM.durations["work"].disabled = phase.blocked;
  FORM.durations["break"].disabled = phase.blocked;
}

Phases.onChanged.addListener(function(phaseName) {
  toggleBlocked(Phases.get(phaseName));
});

Phases.getCurrent(toggleBlocked);
