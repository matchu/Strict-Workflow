function updateBadgeText(completeAt) {
  if (completeAt) {
    var timeRemainingInMilliseconds = completeAt - Date.now();
    var timeRemainingInMinutes = Math.round(timeRemainingInMilliseconds / 1000 / 60);
    var text = timeRemainingInMinutes.toString();
  } else {
    var text = "";
  }
  chrome.browserAction.setBadgeText({text: text});
}

Phases.onChanged.addListener(function(state) {
  var phase = Phases.get(state.phaseName);

  // Update browser action appearance
  chrome.browserAction.setBadgeBackgroundColor({
    color: phase.browserAction.badgeBackgroundColor
  });
  chrome.browserAction.setIcon({
    path: phase.browserAction.iconUrl
  });

  // Start alarms for badge text
  if (phase.completeAt) {
    chrome.alarms.create("browserActionTick", {periodInMinutes: 1});
  } else {
    // Clearing the timer may throw an warning if it doesn't exist yet, but
    // it'll happen asynchronously and not interrupt the current function.
    chrome.alarms.clear("browserActionTick");
  }
  updateBadgeText(state.completeAt);
});

chrome.browserAction.onClicked.addListener(function() {
  Phases.trigger("next");
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "browserActionTick") {
    Phases.getCurrentState(function(state) {
      updateBadgeText(state.completeAt);
    });
  }
});
