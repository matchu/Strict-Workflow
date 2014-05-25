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

Phases.onChanged.addListener(function(phaseName, completeAt) {
  var phase = Phases.get(phaseName);

  // Update browser action appearance
  if (phase.browserAction) {
    var iconName = phaseName;
    chrome.browserAction.setBadgeBackgroundColor({
      color: phase.browserAction.badgeBackgroundColor
    });
  } else {
    var iconName = phase.on.next + "_pending";
  }
  chrome.browserAction.setIcon({
    path: "icons/" + iconName + ".png"
  });

  // Start alarms for badge text
  if (completeAt) {
    chrome.alarms.create("browserActionTick", {periodInMinutes: 1});
  } else {
    // Clearing the timer may throw an warning if it doesn't exist yet, but
    // it'll happen asynchronously and not interrupt the current function.
    chrome.alarms.clear("browserActionTick");
  }
  updateBadgeText(completeAt);
});

chrome.browserAction.onClicked.addListener(function() {
  Phases.trigger("next");
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "browserActionTick") {
    Phases.getCurrentState(function(phaseName, completeAt) {
      updateBadgeText(completeAt);
    });
  }
});
