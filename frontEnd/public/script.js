var app={
  initialize: function() {
    $( "#target" ).keypress(function( event ) {
      if ( event.which == 13 ) {
         event.preventDefault();
         speech = $( "#target" ).val();
         app.getServerResponse(speech);
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
    });
	},

  makeHTML:function(data){
    $('#response').html("<p>"+data+"</p>");
    console.log("3: data= "+data)
  },

  getServerResponse: function(speech) {
    console.log("1 : speech = "+speech)
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
			}
		});
	}


};
