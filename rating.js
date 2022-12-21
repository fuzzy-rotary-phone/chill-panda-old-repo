function storeRating(stars) {
	if(!localStorage['guid']) {
		gaSetUserId();
	}

	var row = {
	    guid: localStorage['guid'] ? localStorage['guid'] : null,
	    game_id: localStorage['lastGame'] ? parseInt(localStorage['lastGame']) : null,
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