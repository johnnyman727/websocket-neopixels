websocket-neopixels
===================

This project demonstrates how to set up a server on Tessel that allows you to send arbitrary animations to Neopixels with a websocket. [Neopixels](http://www.adafruit.com/category/168) is Adafruit's brand for strips of individually addressanle RGB LEDs.

It uses the [`nodejs-websocket`](https://github.com/sitegui/nodejs-websocket) library to create the server and the [`neopixels`](https://github.com/tessel/neopixels) library to write the animations. 

I haven't tested it on animations greater than 10k bytes long but it worked well with my simple tests. 


## Install
```
npm install websocket-neopixels
```

Then, make sure you [install the Neopixels firmware](https://github.com/tessel/neopixels#installation) on your Tessel. Note that I have [a PR open](https://github.com/tessel/firmware/pull/71) to merge Neopixels support into the official firmware build but it hasn't landed at the time of this writing.

Power your Neopixels and plug the data pin into G4 on Tessel.

## Usage

`server.js` is a 30 line server that you'll run on Tessel. It simply opens a websocket server, parses any incoming streams, and routes the animation to the Neopixels.

Make sure your Tessel is connected to WiFi (`tessel wifi -n SSID -p PASS`) before running the script. I didn't add any re/connect functionality to this example.

Once connected to wifi, run it with `tessel run server.js`. 
```.js

var ws = require("nodejs-websocket"),
    Neopixels = require('neopixels'),
    neopixels = new Neopixels();
    tessel = require('tessel');
    port = 8000,

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
```

The client gets run with Node.js. It connects to the Tessel's server, then waits to receive "on" or "off" from the command line which will create an animation to either turn all the LEDs on or off.

Note that you need to change the address of the server to whatever your Tessel's IP Address is. You may also need to change the number of LEDs your animation. I was using a 24 pixel ring. 

Wait until your Tessel reports that it's listening on port 8000, then run `tessel run client.js` to connect to the Tessel. You can start typing 'on' and 'off' into the command line to animate your Neopixels.
```.js
var ws = require("nodejs-websocket");
var port = 8000;
// You may need to change this in your script
var numLEDs = 24;

// Set the binary fragmentation to 1 byte so it instantly sends
// anything we write to it
ws.setBinaryFragmentation(1);

var numLEDsBuffer = new Buffer(4);
numLEDsBuffer.writeUInt32BE(numLEDs, 0);

// Make a buffer to store the RGB values for each pixel
var onAnimation = new Buffer(numLEDs * 3);
// Make all the pixels white (equal R,G,B)
onAnimation.fill(0xff);

// Make another buffer to store animation for off buffer
var offAnimation = new Buffer(numLEDs * 3);
// Fill it with zero (R,G, and B are all off)
offAnimation.fill(0x00);

// When we get a connection (Put your Tessel's IP Address here!)
var connection = ws.connect('ws://192.168.8.110:' + port, function() {
  // Pipe the data to our server
  process.stdin.on('data', function(data) {
    // Check for off command
    if (data.toString() == 'off\n') {
      // Send the number of LEDs and the animation data
      connection.sendBinary(Buffer.concat([numLEDsBuffer, offAnimation]));
    }
    else if (data.toString() == 'on\n'){
      // Send the number of LEDs and the animation data
      connection.sendBinary(Buffer.concat([numLEDsBuffer, onAnimation]));
    }
  })
});

```


