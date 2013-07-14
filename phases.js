var DEFAULT_STATE = {name: "free", completeAt: null};

var Phases = {
  _ALL: {
    "free": {
      blocked: false,
      on: {start: "work"}
    },
    "work": {
      blocked: true,
      on: {alarm: "afterWork"},
      browserAction: {badgeBackgroundColor: [192, 0, 0, 255]}
    },
    "afterWork": {
      blocked: true,
      on: {start: "break", exit: "free"}
    },
    "break": {
      blocked: false,
      on: {alarm: "afterBreak"},
      browserAction: {badgeBackgroundColor: [0, 192, 0, 255]}
    },
    "afterBreak": {
      blocked: true,
      on: {start: "work", exit: "free"}
    }
  },
  get: function(phaseName) { return this._ALL[phaseName] },
  getCurrentState: function(callback) {
    chrome.storage.local.get({phaseState: DEFAULT_STATE}, function(items) {
      callback(items.phaseState.name, items.phaseState.completeAt);
    });
  },
  getCurrent: function(callback) {
    this.getCurrentState(function(phaseName, completeAt) {
      callback(Phases.get(phaseName), completeAt);
    });
  },
  setCurrentName: function(phaseName) {
    var phase = Phases.get(phaseName);
    if (phase.on.alarm) {
      var completeAt = Date.now() + (1000 * 60 * 2); // TODO: actual durations
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
  },
  onChanged: {
    addListener: function(callback) {
      chrome.runtime.onMessage.addListener(function(request) {
        if ("phaseChanged" in request) {
          var e = request.phaseChanged;
          callback(e.name, e.completeAt);
        }
      });
    }
  }
};
