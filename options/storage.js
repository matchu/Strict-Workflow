var Options = {
  _DEFAULTS: {
    "siteList": {
      "sites": [
        "facebook.com",
        "youtube.com",
        "twitter.com",
        "tumblr.com",
        "pinterest.com",
        "myspace.com",
        "livejournal.com",
        "digg.com",
        "stumbleupon.com",
        "reddit.com",
        "kongregate.com",
        "newgrounds.com",
        "addictinggames.com",
        "hulu.com"
      ],
      "type": "blacklist"
    },
    "durations": {
      "work": 5000,
      "break": 5000
    },
    "notifications": true,
    "audio": true,
    "warnAboutReblocking": true
  },
  _formatKey: function(key) { return "prefs." + key },
  _unformatKey: function(key) { return key.substr("prefs.".length) },
  _transformItems: function(items, transformKey) {
    var newItems = {};
    Object.keys(items).forEach(function(key) {
      newItems[transformKey(key)] = items[key];
    });
    return newItems;
  },
  get: function(keys, callback) {
    if (typeof keys === "string") keys = [keys];
    var newKeys = {};
    keys.forEach(function(key) {
      newKeys[Options._formatKey(key)] = Options._DEFAULTS[key];
    });
    console.log("Getting options", newKeys);
    chrome.storage.sync.get(newKeys, function(items) {
      callback(Options._transformItems(items, Options._unformatKey));
    });
  },
  set: function(items, callback) {
    var newItems = this._transformItems(items, this._formatKey);
    console.log("Setting options", items, newItems);
    chrome.storage.sync.set(newItems, callback);
  }
};
