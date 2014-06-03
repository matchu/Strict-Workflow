// Consider: if this block were included in lib/phases.js, then the background
// page, content scripts, and options page would *all* try to listen for the
// phaseComplete alarm and trigger the alarm action. Bad news. We only need one
// process in charge of this job, so we explicitly assign it only to the
// background page.
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "phaseComplete") {
    Phases.trigger("alarm");
  }
});
