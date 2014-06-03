// Yes, we're strict, but we want *some* nuclear option to reset the extension.
// Closing the browser is severe enough that people with even a modicum of
// motivation will know better, so we reset whenever the browser starts up, and
// therefore reset whenever the user presses the big red button of restarting
// the browser.
chrome.runtime.onStartup.addListener(function() {
  chrome.alarms.clearAll();
  Phases.startTransition({start: "free"});
});
