/*
  Localization
*/

// Localize all elements with a data-i18n="message_name" attribute
var localizedElements = document.querySelectorAll('[data-i18n]'), el, message;
for(var i = 0; i < localizedElements.length; i++) {
  el = localizedElements[i];
  message = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
  
  // Capitalize first letter if element has attribute data-i18n-caps
  if(el.hasAttribute('data-i18n-caps')) {
    message = message.charAt(0).toUpperCase() + message.substr(1);
  }
  
  el.innerHTML = message;
}

/*
  Form interaction
*/

var form = document.getElementById('options-form'),
  siteWhitelistEl = document.getElementById('whitelist'),
  siteBlacklistEl = document.getElementById('blacklist'),
  whitelistSelectEl = document.getElementById('blacklist-or-whitelist'),
  showNotificationsEl = document.getElementById('show-notifications'),
  shouldRingEl = document.getElementById('should-ring'),
  clickRestartsEl = document.getElementById('click-restarts'),
  saveSuccessfulEl = document.getElementById('save-successful'),
  timeFormatErrorEl = document.getElementById('time-format-error'),
  background = chrome.extension.getBackgroundPage(),
  startCallbacks = {}, durationEls = {};
  
durationEls['work'] = document.getElementById('work-duration');
durationEls['break'] = document.getElementById('break-duration');

var TIME_REGEX = /^([0-9]+)(:([0-9]{2}))?$/;

form.onsubmit = function () {
  console.log("form submitted");
  var durations = {}, duration, durationStr, durationMatch;
  
  for(var key in durationEls) {
    durationStr = durationEls[key].value;
    durationMatch = durationStr.match(TIME_REGEX);
    if(durationMatch) {
      console.log(durationMatch);
      durations[key] = (60 * parseInt(durationMatch[1], 10));
      if(durationMatch[3]) {
        durations[key] += parseInt(durationMatch[3], 10);
      }
    } else {
      timeFormatErrorEl.className = 'show';
      return false;
    } 
  }
  
  console.log(durations);
  
  background.setPrefs({
    siteWhitelist:    siteWhitelistEl.value.split(/\r?\n/),
    siteBlacklist:    siteBlacklistEl.value.split(/\r?\n/),
    durations:          durations,
    showNotifications:  showNotificationsEl.checked,
    shouldRing:         shouldRingEl.checked,
    clickRestarts:      clickRestartsEl.checked,
    whitelist:          whitelistSelectEl.selectedIndex == 1
  })
  saveSuccessfulEl.className = 'show';
  return false;
}

siteBlacklistEl.onfocus = formAltered;
siteWhitelistEl.onfocus = formAltered;
showNotificationsEl.onchange = formAltered;
shouldRingEl.onchange = formAltered;
clickRestartsEl.onchange = formAltered;
whitelistSelectEl.onchange = function() { setListVisibility(); formAltered(); };

function setListVisibility() {
  if (whitelistSelectEl.selectedIndex) {
    siteBlacklistEl.style.display = 'none';
    siteWhitelistEl.style.display = 'inline';
  } else {
    siteBlacklistEl.style.display = 'inline';
    siteWhitelistEl.style.display = 'none';
  }
}

function formAltered() {
  saveSuccessfulEl.removeAttribute('class');
  timeFormatErrorEl.removeAttribute('class');
}

siteBlacklistEl.value = background.PREFS.siteBlacklist.join("\n");
siteWhitelistEl.value = background.PREFS.siteWhitelist.join("\n");
showNotificationsEl.checked = background.PREFS.showNotifications;
shouldRingEl.checked = background.PREFS.shouldRing;
clickRestartsEl.checked = background.PREFS.clickRestarts;
whitelistSelectEl.selectedIndex = background.PREFS.whitelist ? 1 : 0;
setListVisibility();

var duration, minutes, seconds;
for(var key in durationEls) {
  duration = background.PREFS.durations[key];
  seconds = duration % 60;
  minutes = (duration - seconds) / 60;
  if(seconds >= 10) {
    durationEls[key].value = minutes + ":" + seconds;
  } else if(seconds > 0) {
    durationEls[key].value = minutes + ":0" + seconds;
  } else {
    durationEls[key].value = minutes;
  }
  durationEls[key].onfocus = formAltered;
}

function setInputDisabled(state) {
  siteBlacklistEl.disabled = state;
  siteWhitelistEl.disabled = state;
  whitelistSelectEl.disabled = state;
  for(var key in durationEls) {
    durationEls[key].disabled = state;
  }
}

startCallbacks.work = function () {
  document.body.className = 'work';
  setInputDisabled(true);
}

startCallbacks.break = function () {
  document.body.removeAttribute('class');
  setInputDisabled(false);
}

if(background.mainPomodoro.mostRecentMode == 'work') {
  startCallbacks.work();
}
