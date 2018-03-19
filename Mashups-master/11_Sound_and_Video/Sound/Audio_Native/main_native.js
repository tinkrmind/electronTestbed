var myKey = 'YOUR API KEY';

var soundIsReady = false;

/*******************/
//FreeSound Requests
/*******************/
//Second Request to FreeSound for Sound File Location
function getSoundContent(soundID){
	var url = 'http://www.freesound.org/apiv2/sounds/' + soundID + '/?token=';
	var myURL = url + myKey;
	$.ajax({
		url: myURL,
		type: 'GET',
		dataType: 'json',
		error: function(data){
			console.log("We got problems");
			console.log(data.status);
		},
		success: function(data){
			console.log("WooHoo 2!");
			console.log(data);
			var audioLink = data.previews['preview-hq-mp3'];
			console.log(audioLink);
			//return;
			makeAudioRequest(audioLink);
		}
	});
}

//Initial Request to FreeSound
function getFreeSound(term){
	//This is for Freesound API v2
	var url = 'http://www.freesound.org/apiv2/search/text/?query=' + term + '&token=';
	var myURL = url + myKey;
	$.ajax({
		url: myURL,
		type: 'GET',
		dataType: 'json',
		error: function(data){
			console.log("We got problems");
			console.log(data.status);
		},
		success: function(data){
			console.log("WooHoo!");
			console.log(data);
			if (data.results.length){
				getSoundContent(data.results[0].id);
			}
			else{
				alert("Uh oh, we got problems... No sounds for that string!");
			}
		}
	});
}

/**************************/
//Native JS - Web Audio API
/**************************/
var context, source, buffer;
var AudioContext = window.AudioContext || window.webkitAudioContext;
//Confirm Web Audio API is available
if (AudioContext) {
	context = new AudioContext();
}
else {
	alert("Web Audio API is not available. Please use a supported browser.");
}

function onError(){
	console.log("We got problems");
}

//JS AJAX Request to Access Sound File
function makeAudioRequest(url){
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	//File data is binary, not text, need an arraybuffer
	request.responseType = 'arraybuffer';

	//Set success functionality
	request.onload = function() {
		context.decodeAudioData(request.response, function(dataBuffer) {
			console.log(request.response);
			console.log(dataBuffer);
			buffer = dataBuffer;
			soundIsReady = true;
			$("button#play").css('background-color', 'green');
		}, onError);
	};
	request.send();
}

//Create the audio source and play it
function playSound(buffer) {
	source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(context.destination);
	source.start(0);
	console.log(source);
}

//Stop playing the audio source
function stopSound(){
	source.stop();
}

/**********************/
//DOM Events with jQuery
/**********************/

$(document).keydown(function(e) {
	//console.log(e);
	//console.log(e.keyCode);
	var curKey = e.keyCode;

	switch(curKey){
		//Up
		case 38:
			//Native WebAudio
			source.playbackRate.value += 0.1;
			console.log(source.playbackRate.value);

			break;
		//Down
		case 40:
			//Native WebAudio
			source.playbackRate.value -= 0.1;
			console.log(source.playbackRate.value);

			break;
	}
});

$(document).ready(function(){
	$('#play').click(function(){
		if (soundIsReady){
			playSound(buffer);
		}
		else{
			alert("Still waiting for the sound to load. The play button will turn green when the sound is ready.");
		}
	});
	$('#pause').click(function(){
		if (soundIsReady){
			stopSound();
		}
		else{
			alert("Still waiting for the sound to load. The play button will turn green when the sound is ready.");
		}
	});

	//Make initial request to FreeSound API
	getFreeSound('ghost');
});