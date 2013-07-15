Phases.onChanged.addListener(function(phaseName) {
  var phase = Phases.get(phaseName);
  if (phase.notification) {
    Options.get("notifications", function(items) {
      if (items.notifications) {
        // TODO: support rich notifications for compatible platforms
        var notification = webkitNotifications.
          createHTMLNotification("/notifications/notification.html");
        notification.show();
      }
    });
  }
});
