let socket = null;

socket_message = function(event){
let msg =JSON.parse(event.data)
  let user = game.users.get(msg.user);
  if (user){
    user.update(
      {
        "flags":{
          "discord-voice-indicator": {
            "mute": msg.mute, 
            "deaf": msg.deaf, 
            "talking": msg.talking
          }
        }
      }
    );
  }
} 

socket_close = function(event){  
  console.log("Socket Closed");
}

socket_error = function(event){
  console.group();
  console.error("Socket Error:");
  console.error(event);
  console.groupEnd();
}

connect = function(){
  if (socket != null){
    socket.close();
  }
  socket = new WebSocket(game.settings.get('discord-voice-indicator', 'server-url'));
  socket.onopen=(event)=>{
    console.log("Socket Opened");
    let users = {};
     for (var [id, user] of game.users.entries()){
      users[id]=user.name;
    }
    socket.send(JSON.stringify(users));
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
    default: "ws://192.168.0.11:12345",
    requiresReload: false
  });

});

Hooks.on('renderSettings', (app, html)=>{
  html.find('#settings-access').prepend($(`<button><i class="fa-brands fa-discord"></i>Connect to Bridge</button>`).click(function(){connect()}))
})

Hooks.on("renderPlayerList", (app, html)=>{
  
})
