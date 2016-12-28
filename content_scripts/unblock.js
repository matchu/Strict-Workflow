(function () {
  var overlay = document.getElementById('matchu-pomodoro-extension-overlay');
  document.body.removeChild(overlay);

  // Remove filters from the blocked page
  var underlayEls = document.querySelectorAll("body > *");
  for (var i in underlayEls) {
    if (underlayEls[i].style) {
      underlayEls[i].style.webkitFilter = "";
    }
  }

  document.body.style.overflow = ""; // Restore horizontal and vertical scrollbars
})();
