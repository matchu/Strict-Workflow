// TODO: Right now we're putting the content script on every page and sending
//       messages to every page, too. It simplifies the code a *ton*, but
//       consider keeping track of the tabs to decide when we even need to
//       inject the script at all. Warning: more difficult than it seems.

function forwardPhaseChanged(tabId, phaseName) {
  chrome.tabs.sendMessage(tabId, {phaseChanged: {phaseName: phaseName}});
}

// Forward phase changes to listening tabs
Phases.onChanged.addListener(function(phaseName) {
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(tab) {
      forwardPhaseChanged(tab.id, phaseName);
    });
  });
});
