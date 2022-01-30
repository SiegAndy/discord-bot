
const Discord = require('discord.js');

function server_to_server(server_name){// lowercased serve name into uppercased server name
    return server_name.slice(0,1).toUpperCase()+server_name.slice(1);
}

function server_to_server_region(server_name){

    for (server_region in server_regions){
      let cur_region = server_regions[server_region];
      let data_centers = region_dc[cur_region]
        for(data_center in data_centers){ 
            // console.log([data_centers[data_center]])
            if(region_dc_servers[server_regions[server_region]][data_centers[data_center]].findIndex((server) => server.localeCompare(server_to_server(server_name)) === 0 ) !== -1){
                return server_regions[server_region];
            }
        }
    }
    console.log("Unkown input server_name from server_to_server_region().")
    return;
}

function server_to_data_center(server_name){
    
    for(data_center in data_centers){ 
        if(dc_server[data_centers[data_center]].findIndex((server) => server.localeCompare(server_to_server(server_name)) === 0) !== -1){
            return data_centers[data_center];
        }
    }
    console.log("Unkown input server_name from server_to_data_center().")
    return;
}

function delay(msec=60000){
    return new Promise(resolve => setTimeout(resolve, msec));
}

function timeout_send(message, content, delaytime=10, deletetime = 60000){
    // console.log(content)
    if (message.channel == undefined){
        setTimeout(() => {console.log(content);}, delaytime);
        return
    }
    if (deletetime == -1){
        setTimeout(() => {message.channel.send(content);}, delaytime);
    }
    else{
        setTimeout(() => {message.channel.send(content).then(d_msg => {d_msg.delete({ timeout: deletetime });});}, delaytime);
    }
}

function user_message_delete (message) {
    let cmd = message.content.split(' ')[0].split('~')[1];
    message.delete({ timeout: 10000 }).then(msg => console.log(`Deleted '${cmd}' message from ${msg.author.username}`)).catch(console.error);
}


function output_json(message, client_msgs, output_msgs){
    //console.log(client_msgs)
    fs.writeFile ("./msgs.json", JSON.stringify (client_msgs, null, 4), err =>{
        if(err) throw err;
        message.reply(output_msgs).then(d_msg => {d_msg.delete({ timeout: 100000 });});
    });
}

function help(message){
    //timeout_send(message, "Incorrect format!");
    timeout_send(message, {embeds: [new Discord.MessageEmbed()
                                        .setColor('#99d6ff')
                                        .setTimestamp()
                                        .addFields(
                                        // { name: "1): Use command '~Write [content]' to preset message."
                                        // , value:"2): Use command '~Get [username]' to read preset message."},
                                        { name: "1): Use command '~fflogs character_firstName character_lastName [combatName] [server_name] ' to get highest rank fflogs."
                                        , value:"		E.g. ~fflogs T'aldarim Annie E5s Sargatanas. combatName and server_name are omitable." },
                                        { name: "2): Use command '~find character_firstName character_lastName [server_name] / lodestone  ' to get ff14 character card."
                                        , value:"		E.g. ~find T'aldarim Annie Sargatanas, or ~find 25526101. Server_name is omitable only if no character with duplicate name in other server." },
                                        { name: "3): Use command '~whoami' to shows discord user card."
                                        , value:"       if linked with ff14 character, ff14 character card would also show up." },)]}
                                    
                                        );
        // message.channel.send("1): Use command '~Write [content]' to preset message.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
		// message.channel.send("2): Use command '~Get [username]' to read preset message.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
		// message.channel.send("3): Use command '~fflogs character_firstName character_lastName [combatName] [server_name] ' to get highest rank fflogs.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
		// message.channel.send("		E.g. ~fflogs T'aldarim Annie E5s Sargatanas. combatName and server_name are omitable.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
        // message.channel.send("4): Use command '~find character_firstName character_lastName [server_name] ' to get ff14 character card.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
        // message.channel.send("		E.g. ~fflogs T'aldarim Annie Sargatanas. ").then(d_msg => {d_msg.delete({ timeout: 60000 });}); 
        // message.channel.send("		server_name is omitable only if there is no character with duplicate name in other server.").then(d_msg => {d_msg.delete({ timeout: 60000 });}); 
        // message.channel.send("5): Use command '~whoami' to shows discord user card.(if linked with ff14 character, ff14 character card would also show up.)").then(d_msg => {d_msg.delete({ timeout: 60000 });});

}

function getProperty(inputObj, target){		
	let names = Object.getOwnPropertyNames(inputObj);
	let values = Object.values(inputObj);
	let index = names.findIndex((input) => input === target);
	if(index === -1){return {found: false, value: -1};}
	else{return {found: true, value: values[index]};}
}

function string_is_int(input,flag=false,msg=""){ //if has flag == true, return a promise
  if (!flag){return Number.isInteger(parseInt(input))}
  return new Promise(async function(resolve, rejects){                           
      if(!Number.isInteger(parseInt(input))){
          rejects(msg);                   
      }
      resolve(true);
  });
}

function isEligible(message, priority){
  // check if the user has one of the roles set above
  // priority 1 = admin; 2 = can only relay
  let isEligible = false;
  let user_level = -1;
  
  switch(priority){
      case 1:
          isEligible = message.member.roles.cache.filter(Role => roleNames.max.includes(Role.name)).length !== 0;
          break;
      case 2:
          isEligible = message.member.roles.cache.filter(Role => roleNames.second.includes(Role.name)).length !== 0;
          break;
      default:
          isEligible = false;
          break;
  };

  if(message.author.id === 483897747137626116){isEligible = true;}
  // deny access
  if (!isEligible) {
    message.reply('No sufficient permission to access this feature, please contact SiegAndy#2157 for further information.');
    return false;
  }
  else{
    message.reply('Access granted.');
    return true;
  }
}

function get_icon_url(job){
  let url = 'https://static.wikia.nocookie.net/ffxiv_gamepedia/images';
  switch(job){
      case 'Astrologian':
          url += '/3/32/Astrologian.png';
          return url;
      case 'Bard':
          url += '/8/82/Bard.png';
          return url;
      case 'Black Mage':
          url += '/4/4e/Black_Mage.png';
          return url;
      case 'Blue Mage':
          url += '/d/d5/Blue_Mage.png';
          return url;
      case 'Dancer':
          url += '/4/41/Dancer.png';
          return url;
      case 'Dark Knight':
          url += '/6/69/Dark_Knight.png';
          return url;
      case 'Dragoon':
          url += '/c/c7/Dragoon.png';
          return url;
      case 'Gunbreaker':
          url += '/3/31/Gunbreaker.png';
          return url;
      case 'Machinist':
          url += '/e/e0/Machinist.png';
          return url;
      case 'Monk':
          url += '/4/44/Monk.png';
          return url;
      case 'Ninja':
          url += '/2/21/Ninja.png';
          return url;
      case 'Paladin':
          url += '/b/b2/Paladin.png';
          return url;
      case 'Scholar':
          url += '/c/c5/Scholar.png';
          return url;
      case 'Summoner':
          url += '/2/2f/Summoner.png';
          return url;        
      case 'Warrior':
          url += '/9/97/Warrior.png';
          return url;
      case 'White Mage':
          url += '/e/e7/White_Mage.png';
          return url;
      case 'Red Mage':
          url += '/3/36/Red_Mage.png';
          return url;
      case 'Samurai':
          url += '/0/09/Samurai.png';
          return url;
      default:
          return 'https://cdn.discordapp.com/attachments/794068116439171083/861067688188969010/800px-Question_opening-closing.png'
  }
}


exports.server_to_server = server_to_server;
exports.server_to_server_region = server_to_server_region;
exports.server_to_data_center = server_to_data_center;
exports.getProperty=getProperty;
exports.string_is_int=string_is_int;
exports.output_json = output_json;
exports.delay = delay;
exports.timeout_send = timeout_send;
exports.user_message_delete = user_message_delete;
exports.help = help;
exports.get_icon_url = get_icon_url;
exports.isEligible = isEligible;
