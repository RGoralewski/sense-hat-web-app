// Default texts
const r = 255;
const g = 0;
const b = 0;
const x = 0;
const y = 0;

// Default server address
var ipAddress;
var port;

/**
* @brief document onReady event handling
*/
$(document).ready(()=>{
	// color and pixel input
	$("#red").val(r);
    $("#green").val(g);
    $("#blue").val(b);
    $("#x").val(x);
    $("#y").val(y);

	// read configuration from config.json
	$.ajax({
        url: 'config.json',
		type: 'GET', dataType: 'json',
		success: function(responseJSON, status, xhr) {
			ipAddress = responseJSON.ip;
			port = responseJSON.port;
		},
	});

	$("#set_pixel").click(sendPixel);
	$("#display_text").click(sendText);
});

/**
* @brief Sends request for pixel set
*/
function sendPixel() {
	var url = 'http://'.concat(ipAddress, ':', port, '/cgi-bin/led_display.py');

	/// Send request
	$.ajax( url,
	{
		type : 'POST',
        data : { // data to send
            r : $("#red").val(),
            g : $("#green").val(),
            b : $("#blue").val(),
            x : $("#x").val(),
            y : $("#y").val()
        }
	});
}

/**
* @brief Sends request for text display
*/
function sendText() {
	var url = 'http://'.concat(ipAddress, ':', port, '/cgi-bin/display_text.py');

	/// Send request
	$.ajax( url,
	{
		type : 'POST',
        data : { // data to send
            r : $("#red").val(),
            g : $("#green").val(),
            b : $("#blue").val(),
            text : $("#text_to_display").val()
        }
	});
}
