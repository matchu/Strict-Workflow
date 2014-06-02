var Phases = {
  _ALL: {
    "free": {
      blocked: false,
      on: {
        always: {
          next: {
            start: "work"
          }
        }
      },
      browserAction: {
        badgeBackgroundColor: [192, 0, 0, 255],
        iconUrl: "icons/work_pending.png"
      }
    },
    "work": {
      blocked: true,
      on: {
        whenRemainingCycles: {
          alarm: {
            start: "break",
            notification: {
              iconUrl: "icons/icon128_green.png",
              message: "Your scheduled break timer has just started. Enjoy!" // TODO
            }
          },
        },
        whenNoRemainingCycles: {
          alarm: {
            start: "afterWork",
            notification: {
              iconUrl: "icons/icon128.png",
              message: "Good work! Now it's time for a break." // TODO
            }
          }
        }
      },
      browserAction: {
        badgeBackgroundColor: [192, 0, 0, 255],
        iconUrl: "icons/work.png"
      }
    },
    "afterWork": {
      blocked: true,
      on: {
        always: {
          next: {start: "break"},
          exit: {start: "free"}
        }
      },
      browserAction: {
        badgeBackgroundColor: [192, 0, 0, 255],
        iconUrl: "icons/work_pending.png"
      },
      controls: {
        next: chrome.i18n.getMessage("start_next_break"),
        exit: chrome.i18n.getMessage("exit")
      }
    },
    "break": {
      blocked: false,
      on: {
        always: {
          next: {start: "work"}
        },
        whenRemainingCycles: {
          alarm: {
            start: "work",
            changeInRemainingCycles: -1,
            notification: {
              iconUrl: "icons/icon128.png",
              message: "Your scheduled work timer has just started. Get to it!" // TODO
            }
          },
        },
        whenNoRemainingCycles: {
          alarm: {
            start: "afterBreak",
            notification: {
              iconUrl: "icons/icon128_green.png",
              message: "Now that you're relaxed, it's time to get back to work." // TODO
            }
          },
          exit: {whenNoRemainingCycles: {start: "free"}}
        }
      },
      browserAction: {
        badgeBackgroundColor: [0, 192, 0, 255],
        iconUrl: "icons/break.png"
      },
      controls: {
        next: chrome.i18n.getMessage("start_next_work"),
        exit: chrome.i18n.getMessage("exit")
      },
      warningNotification: {
        type: "basic",
        title: "Careful!", // TODO
        message: "Once this break is over, distracting pages will be " +
                 "re-blocked immediately. " +
                 "Don't start something if you can't finish it by the end " +
                 "of the break.", // TODO
        iconUrl: "icons/icon128_green.png",
        buttons: [
          {title: "Got it; never warn me again."} // TODO
        ]
      }
    },
    "afterBreak": {
      blocked: true,
      on: {
        always: {
          next: {start: "work"},
          exit: {start: "free"}
        }
      },
      browserAction: {
        badgeBackgroundColor: [0, 192, 0, 255],
        iconUrl: "icons/break_pending.png"
      },
      controls: {
        next: chrome.i18n.getMessage("start_next_work"),
        exit: chrome.i18n.getMessage("exit")
      }
    }
  },
  _DEFAULT_STATE: {phaseName: "free", completeAt: null, remainingCycles: 0},
  get: function(phaseName) { return this._ALL[phaseName] },
  getCurrentState: function(callback) {
    chrome.storage.local.get(
      {phaseState: this._DEFAULT_STATE},
      function(items) {
        callback(items.phaseState);
      }
    );
  },
  getCurrent: function(callback) {
    this.getCurrentState(function(state) {
      callback(Phases.get(state.phaseName), state);
    });
  },
  _getDurationFor: function(phaseName, callback) {
    Options.get("durations", function(items) {
      callback(items.durations[phaseName]);
    });
  },
  startTransition: function(transition) {
    var newPhaseName = transition.start;
    var newPhase = Phases.get(newPhaseName);
    Phases.getCurrentState(function(oldState) {
      // TODO: skip this get for untimed phases
      Phases._getDurationFor(newPhaseName, function(duration) {
        var newPhaseState = {phaseName: newPhaseName};

        var changeInRemainingCycles = transition.changeInRemainingCycles || 0;
        newPhaseState.remainingCycles =
          oldState.remainingCycles + changeInRemainingCycles;
        // The phase state machine should only decrement when it knows that
        // there are remaining cycles, and the UI should block attempts to
        // do anything but add cycles, but this assertion helps us check those
        // assumptions during development.
        console.assert(newPhaseState.remainingCycles >= 0);

        chrome.alarms.clear("phaseComplete", function() {});
        var transitions = Phases.getTransitions(newPhaseState);
        if ("alarm" in transitions) {
          newPhaseState.completeAt = Date.now() + duration;
          chrome.alarms.create("phaseComplete", {
            when: newPhaseState.completeAt
          });
        }

        chrome.storage.local.set({phaseState: newPhaseState}, function() {
          chrome.runtime.sendMessage({
            phaseChanged: {
              newPhaseState: newPhaseState,
              transition: transition
            }
          });
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
          callback(e.newPhaseState, e.transition);
        }
      });
    }
  },
  getTransitions: function(state) {
    var transitions = {};

    function addTransitions(someTransitions) {
      if (typeof someTransitions === 'object') {
        Object.keys(someTransitions).forEach(function(key) {
          transitions[key] = someTransitions[key];
        });
      }
    }

    var phase = this.get(state.phaseName);

    addTransitions(phase.on.always);
    if (state.remainingCycles > 0) {
      addTransitions(phase.on.whenRemainingCycles);
    } else {
      addTransitions(phase.on.whenNoRemainingCycles);
    }

    return transitions;
  },
  getCurrentTransitions: function(callback) {
    this.getCurrentState(function(state) {
      callback(Phases.getTransitions(state));
    });
  },
  trigger: function(actionName) {
    this.getCurrentTransitions(function(transitions) {
      Phases.startTransition(transitions[actionName]);
    });
  }
};