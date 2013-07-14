chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "phaseComplete") {
    Phases.getCurrent(function(phase) {
      Phases.setCurrentName(phase.on.alarm);
    });
  }
});

function reset() {
  console.log("Resetting.");
  chrome.alarms.clear("phaseComplete");
  Phases.setCurrentName("free");
}

chrome.runtime.onStartup.addListener(reset);
chrome.runtime.onInstalled.addListener(reset);
