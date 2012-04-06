var form = document.getElementById('options-form'),
  siteListEl = document.getElementById('site-list'),
  whitelistEl = document.getElementById('blacklist-or-whitelist'),
  shouldRingEl = document.getElementById('should-ring'),
  clickRestartsEl = document.getElementById('click-resets'),
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
    siteList:        siteListEl.value.split(/\r?\n/),
    durations:       durations,
    shouldRing:      shouldRingEl.checked,
    clickRestarts:   clickRestartsEl.checked,
    whitelist:       whitelistEl.selectedIndex == 1
  })
  saveSuccessfulEl.className = 'show';
  return false;
}

siteListEl.onfocus = formAltered;
shouldRingEl.onchange = formAltered;
clickRestartsEl.onchange = formAltered;
whitelistEl.onchange = formAltered;

function formAltered() {
  saveSuccessfulEl.removeAttribute('class');
  timeFormatErrorEl.removeAttribute('class');
}

siteListEl.value = background.PREFS.siteList.join("\n");
shouldRingEl.checked = background.PREFS.shouldRing;
clickRestartsEl.checked = background.PREFS.clickRestarts;
whitelistEl.selectedIndex = background.PREFS.whitelist ? 1 : 0;

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
  siteListEl.disabled = state;
  whitelistEl.disabled = state;
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
