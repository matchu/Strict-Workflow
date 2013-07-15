var Controls = {
  build: function(phase) {
    var wrapper = document.createElement("div");
    wrapper.className = chrome.i18n.getMessage("@@extension_id") + "-controls";

    if (phase.on.next) {
      var nextButton = this._buildOne("next");
      nextButton.innerText = chrome.i18n.getMessage("start_next_" + phase.on.next);
      wrapper.appendChild(nextButton);
    }

    if (phase.on.exit) {
      var exitButton = this._buildOne("exit");
      exitButton.innerText = chrome.i18n.getMessage("exit");
      wrapper.appendChild(exitButton);
    }

    return wrapper;
  },
  _buildOne: function(action) {
    var button = document.createElement("button");
    button.addEventListener("click", function() {
      Phases.trigger(action);
    });
    return button;
  }
};
