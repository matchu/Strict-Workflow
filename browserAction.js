Phases.onChanged.addListener(function(phaseName) {
  var phase = Phases.get(phaseName);
  if (phase.browserAction) {
    var iconName = phaseName;
    chrome.browserAction.setBadgeBackgroundColor({
      color: phase.browserAction.badgeBackgroundColor
    });
  } else {
    var iconName = phase.on.start + "_pending";
  }
  chrome.browserAction.setIcon({
    path: "icons/" + iconName + ".png"
  });
});

chrome.browserAction.onClicked.addListener(function() {
  Phases.getCurrent(function(phase) {
    if (phase.on.start) {
      Phases.setCurrentName(phase.on.start);
    }
  });
});
