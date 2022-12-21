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