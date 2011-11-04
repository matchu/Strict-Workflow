(function () {
  function ready() {
    if(!document.getElementById('matchu-pomodoro-extension-overlay')) {
      var overlay = document.createElement('div'), lines = [
        'Page blocked until a Pomodoro break session starts.',
        'Back to work!'
      ], p;
      overlay.id = 'matchu-pomodoro-extension-overlay';
      overlay.style.position = 'fixed';
      overlay.style.left = 0;
      overlay.style.top = 0;
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = '#ddd';
      overlay.style.zIndex = 9000001;
      overlay.style.padding = '1em';
      overlay.style.textAlign = 'center';
      overlay.style.color = '#000';
      overlay.style.font = 'normal normal normal 14px/1 sans-serif';
      for(var i in lines) {
        p = document.createElement('p');
        p.innerText = lines[i];
        p.style.margin = '0 0 1em 0';
        overlay.appendChild(p);
      }
      document.body.appendChild(overlay);
    }
  }
  
  if(typeof document === 'undefined') {
    window.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
