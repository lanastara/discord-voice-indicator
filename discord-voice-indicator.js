let socket = null;

socket_message = function(event){
  console.group();
  console.log("Message Received");
  console.log(event);
  console.groupEnd();
} 

socket_close = function(event){  
  console.log("Socket Closed");
  socket = null;
}

socket_error = function(event){
  console.group();
  console.errof("Socket Error:");
  console.errof(event);
  console.groupEnd();
}

connect = function(){
  if (socket != null){
    socket.close();
  }
  socket = new WebSocket(game.settings.get('discord-voice-indicator', 'server-url'));
  socket.onopen=(event)=>{
    console.log("Socket Opened");
  };
  socket.onmessage = socket_message;
  socket.onerror=socket_error;
  socket.onclose= socket_close;
}

Hooks.once("init", async () => {
  game.settings.register('discord-voice-indicator', 'server-url', {
    hint: "Url of the discord bridge",
    name: `Server Url`,
    scope: "world",
    config: true,
    type: String,
    default: "ws://127.0.0.1:12345",
    requiresReload: false
  });

});

Hooks.on('renderSettings', (app, html)=>{
  html.find('#settings-access').prepend($(`<button><i class="fa-brands fa-discord"></i>Connect to Bridge</button>`).click(function(){connect()}))
})


