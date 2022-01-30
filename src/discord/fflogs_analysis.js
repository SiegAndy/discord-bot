const{FluentFFlogs} = require('../util/classes')
const{server_to_server_region, timeout_send} = require('../util/funcs')
const{FFLOGS_API_KEY, zone_43, zone_44, zone_30, zone_32, zone_38} = require('../util/variables')
const { find_character } = require('./loadstone.js');
const axios = require('axios');


function incorrect_format(message){
    message.channel.send("Incorrect format").then(d_msg => {d_msg.delete({ timeout: 60000 });});
    message.channel.send("Use command '~fflogs [character_firstName] [character_lastName] [combatName] [server_name] ' to get highest rank fflogs.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
    message.channel.send("		E.g. ~fflogs T'aldarim Annie E5s Sargatanas. combatName and server_name are omitable.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
}

//return combat_zone_name, combat_difficulty(normal/savage), encounter_id, encounter_zone
function find_combat_zone(combatName){
  switch(combatName){
      case 'e5':return ["Ramuh",100,69,33];
      case 'e5s':return ["Ramuh",101,69,33];
      case 'e6':return ["Ifrit and Garuda",100,70,33];
      case 'e6s':return ["Ifrit and Garuda",101,70,33];
      case 'e7':return ["The Idol of Darkness",100,71,33];
      case 'e7s':return ["The Idol of Darkness",101,71,33];
      case 'e8':return ["Shiva",100,72,33];
      case 'e8s':return ["Shiva",101,72,33];
      case 'e9':return ["Cloud of Darkness",100,73,38];
      case 'e9s':return ["Cloud of Darkness",101,73,38];
      case 'e10':return ["Shadowkeeper",100,74,38];
      case 'e10s':return ["Shadowkeeper",101,74,38];
      case 'e11':return ["Fatebreaker",100,75,38];
      case 'e11s':return ["Fatebreaker",101,75,38];
      case 'e12':return ["Eden's Promise",100,76,38];
      case 'e12sp1':return ["Eden's Promise",101,76,38];
      case 'e12sp2':return ["Oracle of Darkness",101,77,38];
      default: return ["error",-1,-1,-1];				
  }
}

// return fflogs json files
async function fetch_logs(message, name, server, zone=-1, encounterID=-1, partition=false, metric='dps', timeframe='historical', mode='parses'){
  // partition= None || 1; metric= dps || hps || bossdps || tankhps || playerspeed; timeframe= historical || today; mode= parses || rankings;
  let URL = `https://www.fflogs.com/v1/${mode}/character/${name}/${server}/${server_to_server_region(server)}?`;
  if(zone != -1){
      URL += `zone=${zone}&`
  }
  if(encounterID !== -1){
      URL += `encounter=${encounterID}&`
  }
  URL += `metric=${metric}&`;
  if(partition){
      URL += `partition=${partition}`;
  }
  URL += `&timeframe=${timeframe}&api_key=${FFLOGS_API_KEY}`;
  try {
      //console.log(URL);
      return await axios.get(URL);    
  } catch (error) {
      timeout_send(message, 'Error happened when fetching data from fflogs, please check inputs!')
      console.log(error);
  }
}


/* return type: [{Server_Region}'NA', {Server Name}'Sargatanas', {Character Name}"T'aldarim Annie"]
return value is for database record usage, the logs data would be directly displayed using Markdown ML
*/
async function check_rank (message){
  
  // message = {'content': "~fflogs T'aldarim Annie E9S"}

  let content = message.content.split(' ').slice(1);
  let character_firstName = "";
  let character_lastName = "";
  let combatName = "";
  let server_name = "";
  let character_info = undefined;
  let has_fight = false;

  switch(content.length){
      case 2: // ~fflogs T'aldarim Annie
          //message.channel.send("Currently, this service is testing. Errors are expected.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
          character_firstName = content[0];
          character_lastName = content[1];
          character_info = await find_character(message, true, lodestone=-1, content[0] + '%20' + content[1]);
          break;
      case 3:// ~fflogs T'aldarim Annie E9s || ~fflogs T'aldarim Annie Sargatanas
          character_firstName = content[0];
          character_lastName = content[1];
          slot3 = content[2].toLowerCase();
          if(slot3.length > 3){// ~fflogs T'aldarim Annie Sargatanas
            server_name = content[2];
            character_info = await find_character(message, true, lodestone=-1, content[0] + '%20' + content[1], content[2]);
          }
          else{// ~fflogs T'aldarim Annie E9s
            combatName = slot3
            server_name = content[2];
            character_info = await find_character(message, true, lodestone=-1, content[0] + '%20' + content[1]);
            has_fight = true;
          }
          break;
      case 4:// ~fflogs T'aldarim Annie E9s Sargatanas || ~fflogs T'aldarim Annie Sargatanas Aether
          character_firstName = content[0];
          character_lastName = content[1];
          slot3 = content[2].toLowerCase();
          if(slot3.length > 3){// ~fflogs T'aldarim Annie Sargatanas Aether
            server_name = content[2];
            character_info = await find_character(message, true, lodestone=-1, content[0] + '%20' + content[1], content[2], content[3]);
          }
          else{// ~fflogs T'aldarim Annie E9s Sargatanas
            combatName = slot3
            server_name = content[3];
            character_info = await find_character(message, true, lodestone=-1, content[0] + '%20' + content[1], content[3]);
            has_fight = true;
          }
          
          break;
      default:
          incorrect_format(message);
          break;
  }

  let result = [undefined, undefined, undefined];
  if(character_info === undefined){return result;}
  // console.log(character_info.Server)
  result = [server_to_server_region(character_info.Server), character_info.Server, character_info.Name]
  
  let output_msgs = "```ml\n";
  output_msgs += `${content[0]} ${content[1]} ${character_info.Server}\n\n     Encounter       Highest Rank        Job\n`;

  let logs = null;
  if(has_fight){
    let encounter = find_combat_zone(combatName);
    if(encounter[1] === -1){
      timeout_send(message, "Supported Fights only includes from Normal Raid Eden 5 to Eden 12 with Normal or Savage difficulty!")
      return result;
    }
    logs = await fetch_logs(message, character_info.Name, character_info.Server, encounter[3], encounter[2], partition=false, metric='dps', timeframe='historical', mode='parses')
    logs = new FluentFFlogs(logs.data).difficulty(101).highest_percentile();
    if(logs.difficulty === 101){
      output_msgs += `${encounter[0]}        ${Math.floor(logs.percentile)}             ${logs.spec}\n`;
    }else{
      output_msgs += `${encounter[0]}       No savage combat data found\n`;        
    }
  
  }
  else{// default print out latest 4 savage fights with no specific partition 
    let encounters = zone_38.encounters;
    let responses = null;
    for (encounter in encounters){
        // console.log(encounters[encounter].id)
        responses = await fetch_logs(message, character_info.Name, character_info.Server, zone_38.id
        , encounters[encounter].id, partition=1, metric='dps', timeframe='historical', mode='parses');
        responses = new FluentFFlogs(responses.data).difficulty(101).highest_percentile()
        if(responses.difficulty === 101){
            output_msgs += `${encounters[encounter].name}        ${Math.floor(responses.percentile)}             ${responses.spec}\n`;
        }else{
            output_msgs += `${encounters[encounter].name}       No savage combat data found\n`;        
        }
    }
  } 

  output_msgs += "```";
  for (hook in webhooks){
    console.log(webhooks[hook])
    axios.post(webhooks[hook],{content : output_msgs});
  } 

  return result;  
}

/* Deprecated functions, might be used to improve act_auto_fflogs

Beginning of auto rank checking process

async function inner_check_rank(message, serverRegion,server_name,character_name,combatName){
  let character_firstName = character_name.split(' ')[0];
  let character_lastName = character_name.split(' ')[1];
  let default_URL = "https://www.fflogs.com/v1/parses/character";
  let api_key = `&api_key=${FFLOGS_API_KEY}`;
  let metric = "?metric=dps";
  let bracket = "&bracket=0";
  let compare = "&compare=0";
  let timeframe = "&timeframe=historical";
  let URL = default_URL + "/" + character_firstName + "%20" + character_lastName + "/" + server_name + "/" + serverRegion + metric + bracket + compare + timeframe + api_key;
  get_content_has_server(message, find_combat_zone(combatName.toLowerCase()), server_name, URL);

}
async function parse_members(message,time){//no return
  let player_info = await auto_fflogs.auto_find_party_member(time);
  //console.log(player_info)
  // try {
  //   data = await fs_promises.readFile('./Data/party_member.json', 'utf8');
  // } 
  // catch (err) {
  //   return console.log(err);
  // }

  let data = player_info.content;
  // if content is error message
  if(typeof(data) === 'string'){
    message.reply(data).then(d_msg => {d_msg.delete({ timeout: 100000 });});
    return;
  }
  //if content is player_info;
  let combat_name = ["e9s","e10s","e11s","e12s"];
  for (let i = 0; i < data.length; ++i){
    let player = data[i];
    for (let j = 0; j < combat_name.length; ++j){
      inner_check_rank(message, player.server_region, player.server, player.name, combat_name[j])
    }
  }
  
}

async function get_members(message){// no return; player_info in file

  let content = message.content.split(' ');
  if(content.length === 2){//with two argument, [1] might be time
    if(content[1].length < 10){// no valid time input, program would use current time
      message.reply("No valid time interval input, program would use current time").then(d_msg => {d_msg.delete({ timeout: 100000 });});
      parse_members(message);
      
      return;
    }
    // time is in form 2021-06-27
    let time = content[1].split('-');
    parse_members(message, time);
  }
  else{// no valid time input, program would use current time
    message.reply("No valid time interval input, program would use current time").then(d_msg => {d_msg.delete({ timeout: 100000 });});
    parse_members(message);
  }
  
  
  
}

End of auto rank checking process 
*/





module.exports = {

  check_rank_onlyCombatName: async function (message, serverRegion,server_name,character_name,combatName){
    //code to be written; supposed to check discord user's ff14 info if linked 
    inner_check_rank(message, serverRegion,server_name,character_name,combatName);
  },

  check_rank: check_rank,    
}


// async function test(){
//   let message = {content : "~fflogs Joe Joe"};
//   let result = await check_rank(message);  
//   console.log(result)
// }
// test()