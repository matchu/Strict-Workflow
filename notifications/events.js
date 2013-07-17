Phases.onChanged.addListener(function(phaseName) {
  var phase = Phases.get(phaseName);
  if (phase.notification) {
    Options.get(["notifications", "audio"], function(items) {
      if (items.notifications) {
        // TODO: support rich notifications for compatible platforms
        var notification = webkitNotifications.
          createHTMLNotification("/notifications/notification.html");
        notification.show();
      }
      if (items.audio) {
        var ring = new Audio("/ring.ogg");
        ring.play();
      }
    });
  }
});
