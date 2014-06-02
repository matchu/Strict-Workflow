Phases.onChanged.addListener(function(state, transition) {
  var phase = Phases.get(state.phaseName);
  var transitions = Phases.getTransitions(state);

  // When a new phase starts, previous notifications are no longer relevant.
  chrome.notifications.clear("warning", function() {});
  chrome.notifications.clear("complete", function() {});

  // Completion notification
  if (transition.notification) {
    Options.get(["notifications", "audio"], function(items) {
      if (items.notifications) {
        var buttons = [];
        if (transitions.next) {
          buttons.push({
            title: phase.controls.next
          });
        }
        if (transitions.exit) {
          buttons.push({
            title: phase.controls.exit
          });
        }
        chrome.notifications.create("complete", {
          type: "basic",
          title: "Ring, ring!", // TODO
          message: transition.notification.message,
          iconUrl: transition.notification.iconUrl,
          buttons: buttons
        }, function() {});
      }
      if (items.audio) {
        var ring = new Audio("/ring.ogg");
        ring.play();
      }
    });
  }

  // Schedule warning notification
  console.log("Considering warning phase: ", phase);
  if ("warningNotification" in phase) {
    Options.get(["warnAboutReblocking"], function(items) {
      if (items.warnAboutReblocking) {
        chrome.notifications.create("warning", phase.warningNotification,
                                    function() {});
      }
    });
  }
});

chrome.notifications.onButtonClicked.addListener(function(id, index) {
  if (id === "complete") {
    if (index === 0) {
      Phases.trigger("next");
    } else {
      Phases.trigger("exit");
    }
  } else if (id === "warning") {
    if (index === 0) {
      Options.set({warnAboutReblocking: false});
    }
  }
});
