
var ws = require("nodejs-websocket"),
    Neopixels = require('neopixels'),
    neopixels = new Neopixels(),
    tessel = require('tessel'),
    port = 8000;

// Create the websocket server, provide connection callback
var server = ws.createServer(function (conn) {
  console.log("Accepted new connection...");

  // If get a binary stream is opened up
  conn.on("binary", function(stream) {
    // When we get data
    stream.on('data', function(data) {
      // Extract the number of LEDs to animate
      var numLEDs = data.readInt32BE(0);
      // Slice off that number
      var animation = data.slice(4);
      // Start the animation
      neopixels.animate(numLEDs, animation);
    });
  });

  conn.on("close", function (code, reason) {
      console.log("Connection closed")
  });
}).listen(port);

console.log('listening on port', port);