var sampleTimeSec = 0.1; 					///< sample time in sec
var sampleTimeMsec = 1000 * sampleTimeSec;	///< sample time in msec
var maxSamplesNumber = 100;				///< maximum number of samples

var xdata; ///< x-axis labels array: time stamps
var ydata; ///< 2D y-axis data array
var default_labels; ///< dafault labels array
var lastTimeStamp; ///< most recent time stamp

var chartContext1;  ///< chart context i.e. object that "owns" chart
var chartContext2;  ///< chart context i.e. object that "owns" chart
var chartContext3;  ///< chart context i.e. object that "owns" chart
var chart1; ///< Chart.js object
var chart2; ///< Chart.js object
var chart3; ///< Chart.js object

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
	chart1.update();
	chart2.update();
	chart3.update();
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
	var url = 'http://'.concat(ipAddress, ':', port, '/sensors_via_deamon.php?id=env');
	$.ajax({
        url: url,
		type: 'GET', dataType: 'json',
		success: function(responseJSON, status, xhr) {
			// assign names and units to labels
			chart1.data.datasets[0].label = responseJSON[0].name.concat(" [", responseJSON[0].unit, "]");
			chart2.data.datasets[0].label = responseJSON[1].name.concat(" [", responseJSON[1].unit, "]");
			chart3.data.datasets[0].label = responseJSON[2].name.concat(" [", responseJSON[2].unit, "]");
			// add data to graph
			addData(+responseJSON[0].value, +responseJSON[1].value, +responseJSON[2].value);
		}
	});
}

/**
* @brief Charts initialization
*/
function chartsInit()
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
	default_labels = ["temperature [C]", "humidity [g/m3]", "pressure [hPa]"];

	// get chart context from 'canvas' element
	chartContext1 = $("#chart1")[0].getContext('2d');
	chartContext2 = $("#chart2")[0].getContext('2d');
	chartContext3 = $("#chart3")[0].getContext('2d');

	chart1 = new Chart(chartContext1, {
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
						labelString: 'Environmental data'
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

	chart2 = new Chart(chartContext2, {
		// The type of chart: linear plot
		type: 'line',

		// Dataset: 'xdata' as labels, 'ydata' as dataset.data
		data: {
			labels: xdata,
			datasets: [{
				fill: false,
				label: default_labels[1],
				backgroundColor: 'rgb(0, 0, 255)',
				borderColor: 'rgb(0, 0, 255)',
				data: ydata[1],
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
						labelString: 'Environmental data'
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

	chart3 = new Chart(chartContext3, {
		// The type of chart: linear plot
		type: 'line',

		// Dataset: 'xdata' as labels, 'ydata' as dataset.data
		data: {
			labels: xdata,
			datasets: [{
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
						labelString: 'Environmental data'
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

	ydata[0] = chart1.data.datasets[0].data;
	ydata[1] = chart2.data.datasets[0].data;
	ydata[2] = chart3.data.datasets[0].data;
	xdata = chart1.data.labels;
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
			chartsInit();
			$("#start").click(startTimer);
			$("#stop").click(stopTimer);
			$("#sampletime").text(sampleTimeMsec.toString());
			$("#samplenumber").text(maxSamplesNumber.toString());
		},
	});

});
