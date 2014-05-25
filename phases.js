var Phases = {
  _ALL: {
    "free": {
      blocked: false,
      on: {next: "work"}
    },
    "work": {
      blocked: true,
      on: {alarm: "afterWork"},
      browserAction: {badgeBackgroundColor: [192, 0, 0, 255]}
    },
    "afterWork": {
      blocked: true,
      on: {next: "break", exit: "free"},
      notification: {iconUrl: "icons/icon128.png"}
    },
    "break": {
      blocked: false,
      on: {alarm: "afterBreak", next: "work", exit: "free"},
      browserAction: {badgeBackgroundColor: [0, 192, 0, 255]}
    },
    "afterBreak": {
      blocked: true,
      on: {next: "work", exit: "free"},
      notification: {iconUrl: "icons/icon128_green.png"}
    }
  },
  _DEFAULT_STATE: {name: "free", completeAt: null},
  get: function(phaseName) { return this._ALL[phaseName] },
  getCurrentState: function(callback) {
    chrome.storage.local.get(
      {phaseState: this._DEFAULT_STATE},
      function(items) {
        callback(items.phaseState.name, items.phaseState.completeAt);
      }
    );
  },
  getCurrent: function(callback) {
    this.getCurrentState(function(phaseName, completeAt) {
      callback(Phases.get(phaseName), completeAt);
    });
  },
  _getDurationFor: function(phaseName, callback) {
    Options.get("durations", function(items) {
      callback(items.durations[phaseName]);
    });
  },
  setCurrentName: function(phaseName) {
    var phase = Phases.get(phaseName);
    // TODO: skip this get for untimed phases
    this._getDurationFor(phaseName, function(duration) {
      if (phase.on.alarm) {
        var completeAt = Date.now() + duration;
        chrome.alarms.create("phaseComplete", {when: completeAt});
      }
      var phaseState = {
        name: phaseName,
        completeAt: completeAt
      };
      chrome.storage.local.set({phaseState: phaseState}, function() {
        chrome.runtime.sendMessage({
          phaseChanged: phaseState
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
    this.getCurrent(function(phase) {
      if (phase.on[actionName]) {
        Phases.setCurrentName(phase.on[actionName]);
      }
    });
  }
};
