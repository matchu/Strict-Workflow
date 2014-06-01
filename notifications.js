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
  if ("alarm" in transitions && !phase.blocked) {
    // TODO: fold this into the current state options instead
    var nextPhase = Phases.get(phase.on.alarm.start);
    console.log("Considering warning next phase:", nextPhase);
    if (nextPhase.blocked) {
      Options.get(["warnAboutReblocking"], function(items) {
        if (items.warnAboutReblocking) {
          // Okay, this is an unblocked phase that goes to a blocked phase by
          // alarm. That can be jarring, so warn the user that it's gonna happen.
          chrome.notifications.create("warning", {
            type: "basic",
            title: "Careful!", // TODO
            message: "Once this break is over, distracting pages will be " +
                     "re-blocked immediately. " +
                     "Don't start something if you can't finish it by the end " +
                     "of the break.", // TODO
            iconUrl: "icons/notifications/" + phase.on.alarm.start + ".png",
            buttons: [
              {title: "Got it; never warn me again."} // TODO
            ]
          }, function() {});
        }
      });
    }
  } else {
    // Clearing the timer may throw an warning if it doesn't exist yet, but
    // it'll happen asynchronously and not interrupt the current function.
    chrome.alarms.clear("warningNotification");
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
