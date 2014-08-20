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
  console.log('Connected to server! You may start typing "on" or "off"');
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
