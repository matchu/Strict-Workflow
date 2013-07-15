Phases.onChanged.addListener(function() {
  window.close();
});

Phases.getCurrent(function(phase) {
  var iconUrl = "/icons/" + phase.on.next + "_full.png";
  document.getElementById("icon").src = iconUrl;
  var controls = Controls.build(phase);
  document.body.appendChild(controls);
});
