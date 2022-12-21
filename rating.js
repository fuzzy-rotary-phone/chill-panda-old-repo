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

loadInstanceVariables(CONTENT_PATH, CONFIG_PATH, loadQuestion)

var questionText

function loadQuestion() {
	questionText = 'How likely are you to recommend ' + RETAIL_NAME + ' to your friends?'
	document.getElementById('question').innerText = questionText	
}

function storeRating(stars) {
	if(!localStorage['guid']) {
		gaSetUserId();
	}

	var row = {
	    guid: localStorage['guid'] ? localStorage['guid'] : null,
	    game_id: localStorage['lastGame'] ? parseInt(localStorage['lastGame']) : null,
		question: questionText,
	    rating: stars,
	    created_at: Math.round(Date.now() / 1000),
	    hostname: window.location.hostname,
		retail_location: localStorage['retailLocation']
	}

	gtag('event', 'rating', row)

	db.collection("rating").add(row)
	.then((docRef) => {
	    console.log("Document written with ID: ", docRef.id);
	    home();
	})
	.catch((error) => {
	    console.error("Error adding document: ", error);
	    home();
	});
}

function home() {
	window.location.href = window.location.origin;
}

gaSetUserId();
gaSetUserProperties();