var socket = io();

function scrollToBottom () {
  // Selectors
  var messages = jQuery('#message');
  var newMessage = messages.children('li:last-child')
  // Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on('connect', function () {
    var params = $.deparam(location.search);
    socket.emit('join', params, function(err) {
        if (err) {
            alert(err);
            location.href = '/';
        }
        else {
          console.log('No error');   
        }
    });
});

socket.on('disconnect', function () {
    //console.log('Disconnected from to the server !');
});

socket.on('newMessage', function (Data) {
    var formatedTime = moment(Data.createdAt);

    var template = $('#message-template').html();
    var html = Mustache.render(template, {
        text: Data.content,
        from: Data.from,
        createdAt: formatedTime.format('h:mm a')  
    });
    $('#message').append(html);
    scrollToBottom();
});

socket.on('login', function(data) {
    console.log("Admin message", data);
});

socket.on('userJoined', function(data) {
    console.log("Admin message", data);
});

socket.on('newLocationMessage', function(data) {
    var formatedTime = moment(data.createdAt);
    
    var template = $('#location-message-template').html();
    var html = Mustache.render(template, {
        from: data.from,
        url: data.url,
        createdAt: formatedTime.format('h:mm a')  
    });

    $('#message').append(html);
    scrollToBottom();    
});

$('#message-form').on('submit', function(e) {
    e.preventDefault();
    var messageTextBox = $("form input[name=message");
    var credentials = $.deparam(location.search);
    socket.emit('createMessage', {
        from: credentials.name,
        body: messageTextBox.val()
    }, function() {
        messageTextBox.val('');
    });
});

var locationButton = $('#send-location');
locationButton.on('click', function(){
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser.');
    }

    locationButton.attr('disabled','disabled').text('Sending location...');
    
    navigator.geolocation.getCurrentPosition(function(position){
        socket.emit('createLocationMessage', {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        });

        locationButton.removeAttr('disabled').text('Send location');

    },function(){
        alert('Unable to fetch location');
        locationButton.removeAttr('disabled').text('Send location');
    });
});