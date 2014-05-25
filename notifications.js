Phases.onChanged.addListener(function(phaseName, completeAt) {
  var phase = Phases.get(phaseName);

  // When a new phase starts, previous notifications are no longer relevant.
  chrome.notifications.clear("warning", function() {});
  chrome.notifications.clear("complete", function() {});

  // Completion notification
  if (phase.notification) {
    Options.get(["notifications", "audio"], function(items) {
      if (items.notifications) {
        chrome.notifications.create("complete", {
          type: "basic",
          title: "Ring, ring!", // TODO
          message: "That's the end of this timer, bro.", // TODO
          iconUrl: "icons/notifications/" + phaseName + ".png",
          buttons: [
            {title: chrome.i18n.getMessage("start_next_" + phase.on.next)},
            {title: chrome.i18n.getMessage("exit")}
          ]
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
  if (phase.on.alarm && !phase.blocked) {
    var nextPhase = Phases.get(phase.on.alarm);
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
            iconUrl: "icons/notifications/" + phase.on.alarm + ".png",
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
