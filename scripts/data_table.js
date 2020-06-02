var sampleTimeSec = 0.1; ///< sample time in sec
var sampleTimeMsec = 1000 * sampleTimeSec; ///< sample time in msec

var lastTimeStamp; ///< most recent time stamp

var timer; ///< request timer

// Default server address
var ipAddress;
var port;

var temp = document.querySelector('#temp');
var humid = document.querySelector('#humid');
var press = document.querySelector('#press');
var roll = document.querySelector('#roll');
var pitch = document.querySelector('#pitch');
var yaw = document.querySelector('#yaw');


/**
 * @brief Add new values to next data point.
 */
function addImuData(d1, d2, d3) {

    // lastTimeStamp += sampleTimeSec;
    // xdata.push(lastTimeStamp.toFixed(4));

    roll.textContent = d1.toFixed(2);
    pitch.textContent = d2.toFixed(2);
    yaw.textContent = d3.toFixed(2);
}
function addEnvData(d1, d2, d3) {

    // lastTimeStamp += sampleTimeSec;
    // xdata.push(lastTimeStamp.toFixed(4));
    temp.textContent = d1.toFixed(2);
    humid.textContent = d2.toFixed(2);
    press.textContent = d3.toFixed(2);
}


/**
 * @brief Start request timer
 */
function startTimer() {
    timer = setInterval(ajaxJSON, sampleTimeMsec);
}

/**
 * @brief Stop request timer
 */
function stopTimer() {
    clearInterval(timer);
}

/**
 * @brief Convert string to upper case
 * @param string string to capitalize
 * @return capitalized string
 */
function jsUcfirst(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @brief Send HTTP GET request to IoT server
 */
function ajaxJSON() {
    var url = 'http://'.concat(ipAddress, ':', port, '/sensors_via_deamon.php?id=rpy');
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        success: function (responseJSON, status, xhr) {
            // add data to array
            addEnvData(+responseJSON[0].value, +responseJSON[1].value, +responseJSON[2].value);
            $("#txt1").text(jsUcfirst(responseJSON[0].name).concat(" [", responseJSON[0].unit, "]"));
            $("#txt2").text(jsUcfirst(responseJSON[1].name).concat(" [", responseJSON[1].unit, "]"));
            $("#txt3").text(jsUcfirst(responseJSON[2].name).concat(" [", responseJSON[2].unit, "]"));
        }
    });
    var url = 'http://'.concat(ipAddress, ':', port, '/sensors_via_deamon.php?id=env');
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        success: function (responseJSON, status, xhr) {
            // add data to array
            addImuData(+responseJSON[0].value, +responseJSON[1].value, +responseJSON[2].value);
            $("#txt4").text(jsUcfirst(responseJSON[0].name).concat(" [", responseJSON[0].unit, "]"));
            $("#txt5").text(jsUcfirst(responseJSON[1].name).concat(" [", responseJSON[1].unit, "]"));
            $("#txt6").text(jsUcfirst(responseJSON[2].name).concat(" [", responseJSON[2].unit, "]"));
        }
    });
}

$(document).ready(() => {
	// load configuration from file
	$.ajax({
        url: 'config.json',
		type: 'GET', dataType: 'json',
		success: function(responseJSON, status, xhr) {
			// get configuration
			ipAddress = responseJSON.ip;
			port = responseJSON.port;
			sampleTimeMsec = +responseJSON.period;
			sampleTimeSec = sampleTimeMsec / 1000;
			maxSamplesNumber = +responseJSON.buffer;

			// init
			$("#start").click(startTimer);
			$("#stop").click(stopTimer);
			$("#sampletime").text(sampleTimeMsec.toString());
		},
	});

});
