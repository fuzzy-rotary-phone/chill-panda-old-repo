function storeRating(stars) {
	if(!localStorage['guid']) {
		gaSetUserId();
	}

	db.collection("rating").add({
	    guid: localStorage['guid'] ? localStorage['guid'] : null,
	    game_id: localStorage['lastGame'] ? localStorage['lastGame'] : null,
	    rating: stars,
	    created_at: new Date(),
	    hostname: window.location.hostname
	})
	.then((docRef) => {
	    console.log("Document written with ID: ", docRef.id);
	})
	.catch((error) => {
	    console.error("Error adding document: ", error);
	});

	window.location.href = window.location.origin;
}

gaSetUserId();
gaSetUserProperties();