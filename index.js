const GAME_MAP = {
	1: 'games/DuckHunt-JS/dist/index.html',
	2: 'games/align-four/index.html',
	3: 'games/flappy-bird/index.html',
	4: 'games/color-match-game-broken/index.html',
	5: 'games/JoyRunner/runner.html',
	6: 'games/snake/index.html',
	7: 'games/sweet-memory-game/index.html',
	8: 'games/tower-blocks/index.html',
	9: 'games/candycrush/index.html',
	10: 'games/Maze2/maze.html'
};
const CONTENT_PATH = 'resources/content.json'
const CONFIG_PATH = 'resources/config.json'
const RETAIL_LOCATION_TAG_NAME = 'where'
const JSON_KEY_FOR_RETAIL_LOCATION = 'urlTag'
const JSON_KEY_FOR_IN_GAME_ASSETS = 'ingamePath'
const JSON_KEY_FOR_AD_ASSETS = 'adPath'
const JSON_KEY_FOR_TOTAL_ADS = 'totalAds'
const JSON_KEY_FOR_WEBSITE = 'website'
const JSON_KEY_FOR_LOGO = 'logo'
const IS_INSTANCE_HANDLED_BY_TAG = true
var IN_GAME_ASSETS_PATH
var AD_ASSETS_PATH
var TOTAL_ADS
var WEBSITE_LINK
var LOGO_PATH
var ALL_CONTENT_INSTANCE_JSON
var INSTANCE_JSON
var CONFIG_JSON

function getRandomNumber() {
	var total = 10;
	var number = 1 + Math.floor(Math.random() * total);
	if (!localStorage['lastGame']) {
		return number;
	}
	while (number == localStorage['lastGame']) {
		number = 1 + Math.floor(Math.random() * total);
	}
	return number;
}

function setRetailLocation(retailLocation) {
	if (retailLocation) {
		localStorage.setItem('retailLocation', retailLocation)
	} else {
		localStorage.setItem('retailLocation', '')
	}
}

function getJsonByKeyValue(data, tagName, tagValue) {
    var matches = $.map(data, function(entry) {
            var match = entry[tagName] == (tagValue ? tagValue : '')
            return match ? entry : null
        });
    return matches.length ? matches[0] : null
}

function setInGameVariables() {
	IN_GAME_ASSETS_PATH = INSTANCE_JSON[JSON_KEY_FOR_IN_GAME_ASSETS]
}

function setAdVariables() {
	AD_ASSETS_PATH = INSTANCE_JSON[JSON_KEY_FOR_AD_ASSETS]
	TOTAL_ADS = INSTANCE_JSON[JSON_KEY_FOR_TOTAL_ADS]
	WEBSITE_LINK = INSTANCE_JSON[JSON_KEY_FOR_WEBSITE]
	LOGO_PATH = INSTANCE_JSON[JSON_KEY_FOR_LOGO]
}

function setInstanceVariables() {
	INSTANCE_JSON = getJsonByKeyValue(ALL_CONTENT_INSTANCE_JSON, JSON_KEY_FOR_RETAIL_LOCATION, localStorage['retailLocation'])
	if (!INSTANCE_JSON) {
		INSTANCE_JSON = ALL_CONTENT_INSTANCE_JSON[0]
	}
	setInGameVariables()
	setAdVariables()
}

function loadInstanceVariables(content_path, config_path, callback) {
	$.getJSON(content_path, function(content) {
		$.getJSON(config_path, function(data) {
			ALL_CONTENT_INSTANCE_JSON = content
			CONFIG_JSON = data
			setInstanceVariables()
			if (callback) {
				callback()
			}
		})
	})
}

function setVariablesInLocalStorage() {
	if (IS_INSTANCE_HANDLED_BY_TAG) {
		var params = new URLSearchParams(location.search)
		setRetailLocation(params.get(RETAIL_LOCATION_TAG_NAME)) // add retail location to local storage
	} else {
		var parts = location.hostname.split('.');
		var subdomain = parts.shift();
		if (subdomain == 'chillpanda') {
			setRetailLocation('')
		} else {
			setRetailLocation(subdomain) // add retail location to local storage
		}
	}
}

function loadGame() {
	var number = getRandomNumber().toString();
	setVariablesInLocalStorage()
	$('#myiframe').attr('src', GAME_MAP[number])
}

let s4 = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
}

//generates random id;
let guid = () => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function gaSetUserId() {
	if (!localStorage['guid']) {
		var id = guid();
		localStorage.setItem('guid', id);
	}
	gtag('set', 'user_id', localStorage['guid']);
}

function gaSetUserProperties() {
	gtag('set', 'user_properties', {
		'appCodeName': navigator["appCodeName"],
		"appName": navigator["appName"],
		"appMinorVersion": navigator["appMinorVersion"],
		"cpuClass": navigator["cpuClass"],
		"platform": navigator["platform"],
		"plugins": navigator["plugins"],
		"opsProfile": navigator["opsProfile"],
		"userProfile": navigator["userProfile"],
		"systemLanguage": navigator["systemLanguage"],
		"userLanguage": navigator["userLanguage"],
		"appVersion": navigator["appVersion"],
		"userAgent": navigator["userAgent"],
		"onLine": navigator["onLine"],
		"cookieEnabled": navigator["cookieEnabled"],
		"mimeTypes": navigator["mimeTypes"]
	});
}

gaSetUserId();
gaSetUserProperties();

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBJQO8HWWCV6a-K33knwHYnIcZwm5-4G9w",
//   authDomain: "chill-panda-c1184.firebaseapp.com",
//   projectId: "chill-panda-c1184",
//   storageBucket: "chill-panda-c1184.appspot.com",
//   messagingSenderId: "97999123599",
//   appId: "1:97999123599:web:c214990d78ab04860b6cfa",
//   measurementId: "G-QNEMSD28TV"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);