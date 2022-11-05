var canvas = document.getElementById('canvas')
var link = document.getElementById('link');
var tag_for_qr = 'coffeecrush'
var options = {
	width: 300,
	color: {
		dark: '#000000',  // Black dots
		light: '#FFFFFF' // Transparent background
	}
}

$.getJSON('resources/content.json', allretailcontent => {
    $.getJSON('resources/config.json', config => {
    	var url = config['prod_url'] + '?' + config['tag1'] + '=' + tag_for_qr
		QRCode.toCanvas(canvas, url, options, function (error) {
			if (error) console.error(error)
		  	console.log('success!');
		})

		var save_to_file = 'qrcode.png'
		link.setAttribute('download', save_to_file)
		link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
		link.click();
		// var save_to_file = 'qrcode.png'
		// QRCode.toFile(config[config['tag1']][tag_for_qr] + save_to_file, url, options, function (err) {
		//   if (err) throw err
		//   console.log('done')
		// })
    })
})

// https://github.com/soldair/node-qrcode#qr-code-options