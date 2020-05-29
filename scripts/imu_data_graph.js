var sampleTimeSec = 0.1; 					///< sample time in sec
var sampleTimeMsec = 1000 * sampleTimeSec;	///< sample time in msec
var maxSamplesNumber = 100;				///< maximum number of samples

var xdata; ///< x-axis labels array: time stamps
var ydata; ///< 2D y-axis data array
var default_labels; ///< dafault labels array
var lastTimeStamp; ///< most recent time stamp

var chartContext;  ///< chart context i.e. object that "owns" chart
var chart; ///< Chart.js object

var timer; ///< request timer

// Default server address
var ipAddress;
var port;

/**
* @brief Add new values to next data point.
* @param d1 New y-axis value eg. roll
* @param d2 New y-axis value eg. pitch
* @param d3 New y-axis value eg. yaw
*/
function addData(d1, d2, d3){
	if(ydata[0].length > maxSamplesNumber)
	{
		removeOldData();
		lastTimeStamp += sampleTimeSec;
		xdata.push(lastTimeStamp.toFixed(4));
	}
	ydata[0].push(d1);
    ydata[1].push(d2);
    ydata[2].push(d3);
	chart.update();
}

/**
* @brief Remove oldest data point.
*/
function removeOldData(){
	xdata.splice(0,1);
    for(i=0; i<3; i++) {
        ydata[i].splice(0,1);
    }
}

/**
* @brief Start request timer
*/
function startTimer(){
	timer = setInterval(ajaxJSON, sampleTimeMsec);
}

/**
* @brief Stop request timer
*/
function stopTimer(){
	clearInterval(timer);
}

/**
* @brief Send HTTP GET request to IoT server
*/
function ajaxJSON() {
	var url = 'http://'.concat(ipAddress, ':', port, '/sensors_via_deamon.php?id=rpy');
	$.ajax({
        url: url,
		type: 'GET', dataType: 'json',
		success: function(responseJSON, status, xhr) {
			// assign names and units to labels
			for (var i=0; i<3; i++) {
				chart.data.datasets[i].label = responseJSON[i].name.concat(" [", responseJSON[i].unit, "]");
			}
			// add data to graph
			addData(+responseJSON[0].value, +responseJSON[1].value, +responseJSON[2].value);
		}
	});
}

/**
* @brief Chart initialization
*/
function chartInit()
{
	// array with consecutive integers: <0, maxSamplesNumber-1>
	xdata = [...Array(maxSamplesNumber).keys()];
	// scaling all values ​​times the sample time
	xdata.forEach(function(p, i) {this[i] = (this[i]*sampleTimeSec).toFixed(4);}, xdata);

	// last value of 'xdata'
	lastTimeStamp = +xdata[xdata.length-1];

	// empty array
	ydata = new Array(3);

	// defalut labels array
	default_labels = ["roll [deg]", "pitch [deg]", "yaw [deg]"];

	// get chart context from 'canvas' element
	chartContext = $("#chart")[0].getContext('2d');

	chart = new Chart(chartContext, {
		// The type of chart: linear plot
		type: 'line',

		// Dataset: 'xdata' as labels, 'ydata' as dataset.data
		data: {
			labels: xdata,
			datasets: [{
				fill: false,
				label: default_labels[0],
				backgroundColor: 'rgb(255, 0, 0)',
				borderColor: 'rgb(255, 0, 0)',
				data: ydata[0],
				lineTension: 0
			},
            {
				fill: false,
				label: default_labels[1],
				backgroundColor: 'rgb(0, 0, 255)',
				borderColor: 'rgb(0, 0, 255)',
				data: ydata[1],
				lineTension: 0
			},
            {
				fill: false,
				label: default_labels[2],
				backgroundColor: 'rgb(255, 255, 0)',
				borderColor: 'rgb(255, 255, 0)',
				data: ydata[2],
				lineTension: 0
			}]
		},

		// Configuration options
		options: {
			responsive: true,
			maintainAspectRatio: false,
			animation: false,
			scales: {
				yAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'IMU values'
					}
				}],
				xAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Time [s]'
					}
				}]
			}
		}
	});

	for (i=0; i<3; i++) {
		ydata[i] = chart.data.datasets[i].data;
	}
	xdata = chart.data.labels;
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
			chartInit();
			$("#start").click(startTimer);
			$("#stop").click(stopTimer);
			$("#sampletime").text(sampleTimeMsec.toString());
			$("#samplenumber").text(maxSamplesNumber.toString());
		},
	});

});
