// We only want one "process" to be in charge of handling phase completion, so
// don't put this in phases.js, since it gets included everywhere. Instead,
// it's explicitly only in our event page to avoid duplicate calls.
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "phaseComplete") {
    Phases.trigger("alarm");
  }
});

function reset() {
  console.log("Resetting.");
  chrome.alarms.clearAll();
  Phases.setCurrentName("free");
}

chrome.runtime.onStartup.addListener(reset);
chrome.runtime.onInstalled.addListener(reset);
