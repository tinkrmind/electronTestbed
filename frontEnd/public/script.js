var play_audio = 1;

var app={

  initialize: function() {
    var curpos = 0;
    var requests = JSON.parse(localStorage.getItem("electronTestbed_requests"));
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
          $('#audio-icon').html("<img style=\"width: 40px\"src=../assets/mute.png />");
          play_audio = 0;
      } else{
        $('#audio-icon').html("<img style=\"width: 40px\"src=../assets/play.png />");
        play_audio = 1;
      }
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
				console.log("2 : data = "+res);
				app.makeHTML(res);
        if(play_audio == 1){
          // Add audio
          $('#audio').html('<audio autoplay><source src="http://as11613.itp.io:1337/assets/output.mp3" type="audio/mpeg"></audio>');
        }
			}
		});
	}
};
