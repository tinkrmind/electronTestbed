var play_audio = 1;
var requests = JSON.parse(localStorage.getItem("electronTestbed_requests"));

var app={
  initialize: function() {
    var curpos = 0;
    pos = requests.length;
    $( "#target" ).keydown(function( event ) {
      // enter 13
      if ( event.which == 13 ) {
        console.log("enter");
         event.preventDefault();
         speech = $( "#target" ).val();
         app.getServerResponse(speech);
         requests[pos] = speech;
         localStorage.setItem("electronTestbed_requests", JSON.stringify(requests));
         pos++;
         curpos = 0;
      }
      //up arrow 38, down arrow 40
      if ( event.which == 38 ) {
         event.preventDefault();
         curpos++;
         console.log("upArrow");
         index = pos-curpos;
         if(typeof requests[index] === 'undefined') {
          // does not exist prevent curpos from being changed
          curpos--;
          $( "#target" ).val('---end of history---');
         }
         else {
          // does exist
           $( "#target" ).val(requests[index]);
         }
      }
      if ( event.which == 40 ) {
        console.log("downArrow");
         event.preventDefault();
         curpos--;
         index = pos-curpos;
         if(typeof requests[index] === 'undefined') {
          // does not exist - prevent curpos from being changed
          curpos++;
          $( "#target" ).val('');
         }
         else {
          // does exist
           $( "#target" ).val(requests[index]);
         }
      }
    });

    $('input').on('click focusin', function() {
      this.value = '';
    });

    $('#refresh').click(function(){
      event.preventDefault();
      $( "#target" ).val('');
      speech = "restart conversation";
      app.getServerResponse(speech);
      requests[pos] = speech;
      localStorage.setItem("electronTestbed_requests", JSON.stringify(requests));
      pos++;
      curpos = 0;
    });

    $('#audio-icon').click(function(){
      event.preventDefault();
      if(play_audio == 1){
          $('#audio-icon').html("<img src=../assets/mute.png />");
          play_audio = 0;
      } else{
        $('#audio-icon').html("<img src=../assets/play.png />");
        play_audio = 1;
      }
    });

    $('#mic-icon').click(function(){
      event.preventDefault();
      $('#mic-icon').html("<img src=../assets/mic_rec.png />");
      app.startDictation();
    });
	},

  makeHTML:function(data){
    $('#response').html("<p>"+data+"</p>");
    // console.log("3 : data = "+data)
  },

  getServerResponse: function(speech) {
    console.log("1 : speech = "+speech)
    console.log($('#response').html("<img style=\"width: 110px\"src=../assets/loading.gif />"));
    $('#response').html("<img style=\"width: 110px\"src=../assets/loading.gif />");

    var reqURL = "http://as11613.itp.io:7999/?test="+speech;
		// var reqURL = "http://104.236.250.123:7999/?test="+speech;
    // var reqURL = "http://127.0.0.1:7999/?test="+speech;
    $.ajax({
			url: reqURL,
			type: 'GET',
			dataType: 'text',
			error: function(err){
				console.log(err);
			},
			success: function(data){
        res = decodeURI(data);
        // debugger
				console.log("2 : data = "+res);
				app.makeHTML(res);
        if(res != ""){ // Play audio if play_audio is 1 and we got a response from server
          if(play_audio == 1){
            // Add audio
            $('#audio').html('<audio autoplay><source src="http://as11613.itp.io:1337/assets/output.mp3" type="audio/mpeg"></audio>');
          }
        } else{
          $('#audio').html('<audio autoplay><source src="http://as11613.itp.io:1337/assets/defaultResponse.mp3" type="audio/mpeg"></audio>');
        }
			}
		});
	},

  startDictation:function() {
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
      var recognition = new webkitSpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.lang = "en-US";
      recognition.start();

      recognition.onresult = function(e) {
        var speech = e.results[0][0].transcript;
        recognition.stop();

        console.log("I heard: " + speech);
        $( "#target" ).val(speech);

        app.getServerResponse(speech);
        requests[pos] = speech;
        localStorage.setItem("electronTestbed_requests", JSON.stringify(requests));
        pos++;
        curpos = 0;

        $('#mic-icon').html("<img src=../assets/mic.png />");
      };

      recognition.onerror = function(e) {
        recognition.stop();
      }
    }
  }
};
