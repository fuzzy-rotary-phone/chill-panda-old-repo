Developer instructions:

Go inside folder and run

"python3 -m http.server"

Open browser and go to http://localhost:8000

You should be able to play a game, reload and play another game


New client addition instructions:

1. Add client info in JSON format in resources/content.json
'id' & 'urlTag' have to be unique.
2. Add client related assets in the assets folder in the same structure as done for previous clients
3. Edit tag_for_qr variable in qrcode.js and open http://localhost:8000/qrcode.html to generate QR code for new client.
4. Save this QR code in the assets folder of the client (beside logo png) for future access.