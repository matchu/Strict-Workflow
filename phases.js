var Phases = {
  _ALL: {
    "free": {
      blocked: false,
      on: {next: "work"}
    },
    "work": {
      blocked: true,
      on: {
        alarm: {
          whenRemainingCycles: "break",
          whenNoRemainingCycles: "afterWork"
        }
      },
      browserAction: {badgeBackgroundColor: [192, 0, 0, 255]},
      decrementRemainingCyclesOn: "alarm"
    },
    "afterWork": {
      blocked: true,
      on: {
        next: "break",
        exit: "free"
      },
      notification: {iconUrl: "icons/icon128.png"}
    },
    "break": {
      blocked: false,
      on: {
        alarm: {
          whenRemainingCycles: "work",
          whenNoRemainingCycles: "afterBreak"
        },
        next: "work",
        exit: "free"
      },
      browserAction: {badgeBackgroundColor: [0, 192, 0, 255]}
    },
    "afterBreak": {
      blocked: true,
      on: {next: "work", exit: "free"},
      notification: {iconUrl: "icons/icon128_green.png"}
    }
  },
  _DEFAULT_STATE: {name: "free", completeAt: null, remainingCycles: 0},
  get: function(phaseName) { return this._ALL[phaseName] },
  getCurrentState: function(callback) {
    chrome.storage.local.get(
      {phaseState: this._DEFAULT_STATE},
      function(items) {
        callback(items.phaseState.name, items.phaseState.completeAt,
                 items.phaseState.remainingCycles);
      }
    );
  },
  getCurrent: function(callback) {
    this.getCurrentState(function(phaseName, completeAt, remainingCycles) {
      callback(Phases.get(phaseName), completeAt, remainingCycles);
    });
  },
  _getDurationFor: function(phaseName, callback) {
    Options.get("durations", function(items) {
      callback(items.durations[phaseName]);
    });
  },
  setCurrentName: function(newPhaseName, changeInRemainingCycles) {
    console.assert(typeof newPhaseName === 'string');
    var newPhase = Phases.get(newPhaseName);
    console.assert(typeof newPhase === 'object');
    Phases.getCurrentState(function(oldPhase, _, remainingCycles) {
      // TODO: skip this get for untimed phases
      Phases._getDurationFor(newPhaseName, function(duration) {
        var newPhaseState = {name: newPhaseName};

        if (newPhase.on.alarm) {
          newPhaseState.completeAt = Date.now() + duration;
          chrome.alarms.create("phaseComplete", {
            when: newPhaseState.completeAt
          });
        }

        newPhaseState.remainingCycles =
          Math.max(remainingCycles + changeInRemainingCycles, 0);

        chrome.storage.local.set({phaseState: newPhaseState}, function() {
          chrome.runtime.sendMessage({phaseChanged: newPhaseState});
        });
      });
    });
  },
  onChanged: {
    addListener: function(callback) {
      chrome.runtime.onMessage.addListener(function(request) {
        if ("phaseChanged" in request) {
          console.log("Phase change request", request);
          var e = request.phaseChanged;
          callback(e.name, e.completeAt);
        }
      });
    }
  },
  trigger: function(actionName) {
    this.getCurrent(function(oldPhase, _, remainingCycles) {
      var behavior = oldPhase.on[actionName];
      if (typeof behavior === 'string') {
        var newPhaseName = behavior;
      } else if (typeof behavior === 'object') {
        if (remainingCycles > 0) {
          var newPhaseName = behavior.whenRemainingCycles;
        } else {
          var newPhaseName = behavior.whenNoRemainingCycles;
        }
      }

      if (actionName === oldPhase.decrementRemainingCyclesOn) {
        changeInRemainingCycles = -1;
      } else {
        changeInRemainingCycles = 0;
      }
      Phases.setCurrentName(newPhaseName, changeInRemainingCycles);
    });
  }
};