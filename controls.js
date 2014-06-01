var Controls = {
  build: function(phase, transitions) {
    var wrapper = document.createElement("div");
    wrapper.className = chrome.i18n.getMessage("@@extension_id") + "-controls";

    if (transitions.next) {
      var nextButton = this._buildOne("next");
      nextButton.innerText = phase.controls.next;
      wrapper.appendChild(nextButton);
    }

    if (transitions.exit) {
      var exitButton = this._buildOne("exit");
      exitButton.innerText = phase.controls.exit;
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
