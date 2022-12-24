const firebaseConfig = {
	apiKey: "AIzaSyBJQO8HWWCV6a-K33knwHYnIcZwm5-4G9w",
	authDomain: "chill-panda-c1184.firebaseapp.com",
	projectId: "chill-panda-c1184",
	storageBucket: "chill-panda-c1184.appspot.com",
	messagingSenderId: "97999123599",
	appId: "1:97999123599:web:c214990d78ab04860b6cfa",
	measurementId: "G-QNEMSD28TV"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();

loadInstanceVariables(CONTENT_PATH, CONFIG_PATH, loadPlaceQuestion)

function loadPlaceQuestion() {
	var question = 'How likely are you to recommend <strong>' + RETAIL_NAME + '</strong> to your friends?'
	document.getElementById('place-question').innerHTML = question
}

function storeRating(stars, type) {
	
	if(!localStorage['guid']) {
		gaSetUserId();
	}

	var row = {
	    guid: localStorage['guid'] ? localStorage['guid'] : null,
	    game_id: localStorage['lastGame'] ? parseInt(localStorage['lastGame']) : null,
		question: (type === 'place') ? $('#place-question')[0].innerText : $('#app-question')[0].innerText,
	    rating: stars,
	    created_at: Math.round(Date.now() / 1000),
	    hostname: window.location.hostname,
		retail_location: localStorage['retailLocation'],
		type: type
	}

	gtag('event', 'rating', row)

	db.collection("rating").add(row)
	.then((docRef) => {
	    console.log("Document written with ID: ", docRef.id);
		if(type == 'app') {
			home();
		}
	})
	.catch((error) => {
	    console.error("Error adding document: ", error);
	    if(type == 'app') {
			home();
		}
	});
}

function home() {
	window.location.href = window.location.origin + (URL_SEARCH_PARAM_FOR_RETAIL_LOCATION ? URL_SEARCH_PARAM_FOR_RETAIL_LOCATION : '')
}

gaSetUserId();
gaSetUserProperties();