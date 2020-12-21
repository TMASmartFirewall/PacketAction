const fs = require('fs');
var readStream = fs.createReadStream("/dev/tma_module");



readStream.on('data', function (data) {
    console.log(data.toString());
});

setInterval(function() {
    // prints out "2", meaning that the callback is not called immediately after 500 milliseconds.
    console.log("Ran after "  + " seconds");
  }, 2500)


