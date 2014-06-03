function SiteMatcher(siteList) {
  var sites = siteList.sites;
  var isWhitelist = siteList.type === "whitelist";
  console.log("matcher create", siteList, sites, isWhitelist);

  function parseLocation(location) {
    var components = location.split('/');
    return {domain: components.shift(), path: components.join('/')};
  }
  
  function locationsMatch(location, listedPattern) {
    return domainsMatch(location.domain, listedPattern.domain) &&
      pathsMatch(location.path, listedPattern.path);
  }

  function pathsMatch(test, against) {
    /*
      index.php ~> [null]: pass
      index.php ~> index: pass
      index.php ~> index.php: pass
      index.php ~> index.phpa: fail
      /path/to/location ~> /path/to: pass
      /path/to ~> /path/to: pass
      /path/to/ ~> /path/to/location: fail
    */
    return !against || test.substr(0, against.length) === against;
  }

  function domainsMatch(test, against) {
    /*
      google.com ~> google.com: case 1, pass
      www.google.com ~> google.com: case 3, pass
      google.com ~> www.google.com: case 2, fail
      google.com ~> yahoo.com: case 3, fail
      yahoo.com ~> google.com: case 2, fail
      bit.ly ~> goo.gl: case 2, fail
      mail.com ~> gmail.com: case 2, fail
      gmail.com ~> mail.com: case 3, fail
    */
    // Case 1: if the two strings match, pass
    if(test === against) {
      return true;
    } else {
      var testFrom = test.length - against.length - 1;

      // Case 2: if the second string is longer than first, or they are the same
      // length and do not match (as indicated by case 1 failing), fail
      if(testFrom < 0) {
        return false;
      } else {
        // Case 3: if and only if the first string is longer than the second and
        // the first string ends with a period followed by the second string,
        // pass
        return test.substr(testFrom) === '.' + against;
      }
    }
  }
  
  this.allows = function allows(url) {
    var location = parseLocation(url.split('://')[1]);
    for(var k in sites) {
      listedPattern = parseLocation(sites[k]);
      if(locationsMatch(location, listedPattern)) {
        // If we're in a whitelist, a matched location is allowed => true
        // If we're in a blacklist, a matched location is not allowed => false
        return isWhitelist;
      }
    }
    
    // If we're in a whitelist, an unmatched location is not allowed => false
    // If we're in a blacklist, an unmatched location is allowed => true
    return !isWhitelist;
  }
}

SiteMatcher.getCurrent = function(callback) {
  Options.get("siteList", function(items) {
    callback(new SiteMatcher(items.siteList));
  });
}
