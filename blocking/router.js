// TODO: Right now we're putting the content script on every page and sending
//       messages to every page, too. It simplifies the code a *ton*, but
//       consider keeping track of the tabs to decide when we even need to
//       inject the script at all. Warning: more difficult than it seems.

function forwardPhaseChanged(tabId, phaseName) {
  chrome.tabs.sendMessage(tabId, {phaseChanged: {name: phaseName,
                                                 completeAt: null}});
}

// Forward phase changes to listening tabs
Phases.onChanged.addListener(function(phaseName) {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(tab) {
      forwardPhaseChanged(tab.id, phaseName);
    });
  });
});

// Listen for trigger requests, since tabs can't use all the APIs we can
chrome.runtime.onMessage.addListener(function(request) {
  if ("trigger" in request) {
    Phases.trigger(request.trigger);
  }
});
