var bgPage = chrome.extension.getBackgroundPage();
bgPage.clicked(); 
// console.log(bgPage.session_count())

var session_count = document.getElementById("today_session_count")
var daily_goal = document.getElementById("daily_goal")
console.log("c",session_count)
session_count.innerHTML = bgPage.session_count()
daily_goal.innerHTML = bgPage.goal()