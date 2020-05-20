// Default values
var ipAddress = '192.168.8.110';
var port = '80';
var period = 100;
var buffer = 100;

/**
* @brief document onReady event handling
*/
$(document).ready(()=>{
    // get configuration from config.json
    $.ajax({
        url: 'config.json',
        type: 'GET', dataType: 'json',
        success: function(responseJSON, status, xhr) {
            // get configuration
            ipAddress = responseJSON.ip;
            port = responseJSON.port;
            period = +responseJSON.period;
            buffer = +responseJSON.buffer;

            // color and pixel input
        	$("#ip_serwera").val(ipAddress);
            $("#port").val(port);
            $("#okres").val(period);
            $("#pamiec").val(buffer);
        },
    });

	$("#save_button").click(saveConfig);
});

/**
* @brief Saves configuration to .json file using save_json.php script
*/
function saveConfig() {

    var json_to_save = {
        ip : $("#ip_serwera").val(),
    	port : $("#port").val(),
    	period : parseInt($("#okres").val()),
    	buffer : parseInt($("#pamiec").val())
    }

    var stringified_json = JSON.stringify(json_to_save);
    console.log(stringified_json);

    $.ajax
    ({
        type: "GET",
        dataType : 'text',
        url: 'save_json.php',
        data: { data: stringified_json },
        success: function (response, status, xhr) {alert("Configuration saved!"); console.log(response); },
        failure: function() {alert("Saving error!");}
    });
}
