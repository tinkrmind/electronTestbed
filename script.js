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
      speech = "restart conversation";
      app.getServerResponse(speech);
    });
	},

  makeHTML:function(data){
    $('#response').html("<p>"+data+"</p>");
    console.log("3")

    $('#response').show(500);
    console.log("4")
  },

  getServerResponse: function(speech) {
    console.log("1 : speech = "+speech)
    $('#response').html("<img src=loading.gif />");

		var reqURL = "http://localhost:8080/?test="+speech;
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
