let socket = null;
let f_socket=null;

socket_message = function(event){
let msg =JSON.parse(event.data)
  let user = game.users.get(msg.user);
  console.log(msg);
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
    if(f_socket)
    {
      f_socket.executeForEveryone("PlayerVoiceStateUpdated", msg);
    }
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

Hooks.once("socketlib.ready", () => {
  f_socket = socketlib.registerModule("discord-voice-indicator");
  f_socket.register("PlayerVoiceStateUpdated", player_voice_state_updated);
});

function player_voice_state_updated(update){
    let id = update.user;
    
    let li =$(`li.player[data-user-id=${id}]`);
    if(!li){
      return;
    }
    let talking = li.find(".player-active");
    let mute = li.find(".mute");
    let deaf = li.find(".deaf");
    if(update.talking)
    {
      talking.addClass("outline");
    }else{
      talking.removeClass("outline");
    }
    if(update.mute)
    {
      mute.removeClass("disabled")
    }else{
      mute.addClass("disabled")
    }
    
    if(update.deaf)
    {
      deaf.removeClass("disabled")
    }else{
      deaf.addClass("disabled")
    }
}
Hooks.on('renderSettings', (app, html)=>{
  html.find('#settings-access').prepend($(`<button><i class="fa-brands fa-discord"></i>Connect to Bridge</button>`).click(function(){connect()}))
})

Hooks.on("renderPlayerList", (app, html)=>{
   html.find(".player").append($('<i class="fa-solid fa-microphone-slash voice-indicator mute disabled"></i><i class="fa-solid fa-volume-xmark voice-indicator deaf disabled"></i>'));
  for (var c of game.users){
    let id = c.id;
    let flags = c.flags["discord-voice-indicator"];
    if (!flags){
      continue;
    }
  
    let li =$(`li.player[data-user-id=${id}]`);
    if(!li){
      continue;
    }
    let talking = li.find(".player-active");
    let mute = li.find(".mute");
    let deaf = li.find(".deaf");
    if(flags.talking)
    {
      talking.addClass("outline");
    }else{
      talking.removeClass("outline");
    }
    if(flags.mute)
    {
      mute.removeClass("disabled")
    }else{
      mute.addClass("disabled")
    }
  
    if(flags.deaf)
    {
      deaf.removeClass("disabled")
    }else{
      deaf.addClass("disabled")
    }
  }
})
