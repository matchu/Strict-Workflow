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
  getCurrentName: function(callback) {
    chrome.storage.local.get({currentPhaseName: "free"}, function(items) {
      callback(items.currentPhaseName);
    });
  },
  getCurrent: function(callback) {
    this.getCurrentName(function(phaseName) {
      callback(Phases.get(phaseName));
    });
  },
  setCurrentName: function(phaseName) {
    var phase = Phases.get(phaseName);
    var message = {phaseName: phaseName};
    if (phase.on.alarm) {
      var completeAt = Date.now() + 5000; // TODO: actual durations
      message.completeAt = completeAt;
      chrome.alarms.create("phaseComplete", {when: completeAt});
    }
    chrome.storage.local.set({currentPhaseName: phaseName}, function() {
      chrome.runtime.sendMessage({phaseChanged: message});
    });
  },
  onChanged: {
    addListener: function(callback) {
      chrome.runtime.onMessage.addListener(function(request) {
        if ("phaseChanged" in request) {
          callback(request.phaseChanged.phaseName);
        }
      });
    }
  }
};
