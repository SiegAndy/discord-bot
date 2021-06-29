
const Discord = require('discord.js');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const server_regions = ["NA","EU","JP"];

const data_centers = ["Aether","Chaos","Crystal","Elemental","Gaia","Light","Mana","Primal"]

const region_dc_servers = {NA:{Aether:["Adamantoise","Cactuar","Faerie","Gilgamesh","Jenova","Midgardsormr","Sargatanas","Siren"]
                                 ,Crystal:["Balmung","Brynhildr","Coeurl","Diabolos","Goblin","Malboro","Mateus","Zalera"]
                                 ,Primal:["Behemoth","Excalibur","Exodus","Famfrit","Hyperion","Lamia","Leviathan","Ultros"]}
                            ,EU:{Chaos:["Cerberus","Louisoix","Moogle","Omega","Ragnarok","Spriggan"]
                                  ,Light:["Lich","Odin","Phoenix","Shiva","Zodiark","Twintania"]}
                            ,JP:{Elemental:["Aegis","Atomos","Carbuncle","Garuda","Gungnir","Kujata","Ramuh","Tonberry","Typhon","Unicorn"]
                                  ,Gaia:["Alexander","Bahamut","Durandal","Fenrir","Ifrit","Ridill","Tiamat","Ultima","Valefor","Yojimbo","Zeromus"]
                                  ,Mana:["Anima","Asura","Belias","Chocobo","Hades","Ixion","Mandragora","Masamune","Pandaemonium","Shinryu","Titan"]}
                            }

const dc_server = {Aether:["Adamantoise","Cactuar","Faerie","Gilgamesh","Jenova","Midgardsormr","Sargatanas","Siren"]
                        ,Chaos:["Cerberus","Louisoix","Moogle","Omega","Ragnarok","Spriggan"]
                        ,Crystal:["Balmung","Brynhildr","Coeurl","Diabolos","Goblin","Malboro","Mateus","Zalera"]
                        ,Elemental:["Aegis","Atomos","Carbuncle","Garuda","Gungnir","Kujata","Ramuh","Tonberry","Typhon","Unicorn"]
                        ,Gaia:["Alexander","Bahamut","Durandal","Fenrir","Ifrit","Ridill","Tiamat","Ultima","Valefor","Yojimbo","Zeromus"]
                        ,Light:["Lich","Odin","Phoenix","Shiva","Zodiark","Twintania"]
                        ,Mana:["Anima","Asura","Belias","Chocobo","Hades","Ixion","Mandragora","Masamune","Pandaemonium","Shinryu","Titan"]
                        ,Primal:["Behemoth","Excalibur","Exodus","Famfrit","Hyperion","Lamia","Leviathan","Ultros"]
                    }

const server_list = ["Adamantoise","Aegis","Alexander","Anima","Asura","Atomos"
                    ,"Bahamut","Balmung","Behemoth","Belias","Brynhildr"
                    ,"Cactuar","Carbuncle","Cerberus","Chocobo","Coeurl"
                    ,"Diabolos","Durandal","Excalibur","Exodus","Faerie"
                    ,"Famfrit","Fenrir","Garuda","Gilgamesh","Goblin"
                    ,"Gungnir","Hades","Hyperion","Ifrit","Ixion"
                    ,"Jenova","Kujata","Lamia","Leviathan","Lich"
                    ,"Louisoix","Malboro","Mandragora","Masamune"
                    ,"Mateus","Midgardsormr","Moogle","Odin","Omega"
                    ,"Pandaemonium","Phoenix","Ragnarok","Ramuh"
                    ,"Ridill","Sargatanas","Shinryu","Shiva","Siren"
                    ,"Tiamat","Titan","Tonberry","Typhon","Ultima"
                    ,"Ultros","Unicorn","Valefor","Yojimbo","Zalera"
                    ,"Zeromus","Zodiark","Spriggan","Twintania"]


function server_to_server(server_name){// lowercased serve name into uppercased server name
    return server_name.slice(0,1).toUpperCase()+server_name.slice(1);
}

function server_to_server_region(server_name){

    for (server_region in server_regions){
        for(data_center in data_centers){ 
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

function timeout_send(message, content, deletetime = 60000){
    setTimeout(function(){message.channel.send(content).then(d_msg => {d_msg.delete({ timeout: deletetime });});}, 10);
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
    timeout_send(message, new Discord.MessageEmbed()
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
                                        , value:"       if linked with ff14 character, ff14 character card would also show up." },));
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

class FluentFFlogs{
    constructor(jsonData) {
      this.data = jsonData;
    }
  
    //fromEncounter(fight_name: string): FluentFFlogs
    fromEncounter(fight_name) {
      let result_array = this.data.filter(function(inputObj){
      if(inputObj!== undefined){
        if(getProperty(inputObj, 'encounterName').found){
          if(getProperty(inputObj, 'encounterName').value === fight_name){
            return inputObj;
          }
        }
        }
      });
      return new FluentFFlogs(result_array);
    }
  
    //spec_name(roleName: string): FluentFFlogs // such as "scholar"
    spec_name(roleName){
      let result_array = this.data.filter(function(inputObj){
      if(inputObj!== undefined){
        if(getProperty(inputObj, 'spec').found){
          if(getProperty(inputObj, 'spec').value === roleName){
            return inputObj;
          }
        }
        }
      });
      return new FluentFFlogs(result_array);
    }
  
    //difficulty(difficulty: number): FluentFFlogs   difficulty = 100 => normal; difficulty = 101 => savage;
    difficulty(difficulty){
      let result_array = this.data.filter(function(inputObj){
      if(inputObj!== undefined){
        if(getProperty(inputObj, 'difficulty').found){
          if(getProperty(inputObj, 'difficulty').value === difficulty){
            return inputObj;
          }
        }
        }
      });
      return new FluentFFlogs(result_array);
    }
  
    //percentileLeq(rating: number): FluentFFlogs
    percentileLeq(rating){
      let result_array = this.data.filter(function(inputObj){
      if(inputObj!== undefined){
        if(getProperty(inputObj, 'percentile').found){
          if(getProperty(inputObj, 'percentile').value <= rating){
            return inputObj;
          }
        }
        }
      });
      return new FluentFFlogs(result_array);
    }
  
    //percentileLeq(rating: number): FluentFFlogs
    percentileLeq(rating){
      let result_array = this.data.filter(function(inputObj){
      if(inputObj!== undefined){
        if(getProperty(inputObj, 'percentile').found){
          if(getProperty(inputObj, 'percentile').value >= rating){
            return inputObj;
          }
        }
        }
      });
      return new FluentFFlogs(result_array);
    }
  
    highest_percentile(){
      let result_array = {};
      result_array = this.data.reduce(function(acc, elem){
      if(acc !== undefined && elem !== undefined){
        if(getProperty(acc, 'percentile').found && getProperty(elem, 'percentile').found){// check whether both have stars field
          let target_value = getProperty(elem, 'percentile').value;
          let orginal_value = getProperty(acc, 'percentile').value;
          if(target_value > orginal_value){//if new one have higher rating return new one
            return elem;
          }
          else if(target_value < orginal_value){//if new one have lower rating return new one
            return acc;
          }
          else{console.log("Error in percentile field");}
        }
        }
      },{percentile: -1});
      return result_array;
    }
  
    print_highest_percentile(encounterName, difficulty){
      let root = this;
      return new Promise(async function(resolve, rejects){
        let result_array = root.fromEncounter(encounterName);
        if(result_array.length = 0){rejects(`No fight record fit in this fight: ${encounterName}`);}
  
        result_array = result_array.difficulty(difficulty);
        if(difficulty === 100) {difficulty = "normal";}
        else if(difficulty === 101) {difficulty = "savage";}
        else{rejects(`error to find fight mode number: ${difficulty}, please choose from 100(normal)/101(savage)!`);}
        if(result_array.length = 0){rejects(`No fight record fit in this difficulty: ${difficulty}`);}
  
        result_array = result_array.highest_percentile();
        if(Object.getOwnPropertyNames(result_array).length === 0){rejects("No fight record fit in this condition.");}
        if(Object.getOwnPropertyNames(result_array).length > 19){rejects("Error happened in highest_percentile, more porperties appeared.");}
        if(result_array.percentile === -1){rejects(`Character: ${result_array.characterName}, has no record fit in this fight: ${encounterName}, in this difficulty: ${difficulty}`);}
        
        return resolve({
                  characterName: result_array.characterName, 
                  spec:result_array.spec, 
                  fight: encounterName, 
                  difficulty: difficulty, 
                  percentile: Math.round(result_array.percentile).toString(), 
                  total_dps: result_array.total.toString()
                });
      });
    }
    
    print(){
      this.data.forEach(element => console.log(element));
    
    }
}

class ff14{
    constructor(){
        this.lodestone = undefined;
        this.server_region = undefined;
        this.data_center = undefined;
        this.server = undefined; 
        this.character_name = undefined;
        this.character_avatar = undefined;
    }
    set_lodestone(input){this.lodestone = input; return this;}
    set_character_name(input){this.character_name = input; return this;}
    set_character_avatar(input){this.character_avatar = input; return this;}
    set_server_region(input){this.server_region = input; return this;}
    set_data_center(input){this.data_center = input; return this;}
    set_server(input){this.server = input; return this;}
    
    get_lodestone(){return this.lodestone;}
    get_character_name(){return this.character_name;}
    get_character_avatar(){return this.character_avatar;}
    get_server_region(){return this.server_region;}
    get_data_center(){return this.data_center;}
    get_server(){return this.server;}
    
    out_json(){
        return {lodestone: this.lodestone,
                server_region: this.server_region,
                data_center: this.data_center,
                server: this.server,
                character_name: this.character_name,
                character_avatar: this.character_avatar,}
    }

    in_json(msgs){// {data_center:**, server:**,character_name:**}
        return new ff14().set_lodestone(msgs.lodestone).set_character_name(msgs.character_name).set_character_avatar(msgs.character_avatar)
                         .set_server_region(msgs.server_region).set_data_center(msgs.data_center).set_server(msgs.server);
    }
}
  
class user{
    constructor(){
        this.data = {username: undefined,
                     userID: undefined,
                     message: [],
                     playlist: [],
                     role_list: [],
                     ff14: [false, new ff14()],};
    }
    create_new(client_msgs){
        fs.writeFile ("./msgs.json", JSON.stringify (client_msgs, null, 4), err =>{
            if(err) throw err;
        });
    }
    set_name(input){this.data.username = input; return this;}
    set_userID(input){this.data.userID = input; return this;}
    //set_message(input){this.data.message.push(input); return this;}
    //set_playlist(input){this.data.playlist.push(input); return this;}
    //set_role_list(input){this.data.role_list.push(input); return this;}
    set_message(input){this.data.message = (input); return this;}
    set_playlist(input){this.data.playlist = (input); return this;}
    set_role_list(input){this.data.role_list = (input); return this;}
    set_ff14(input){this.data.ff14 = [true, input]; return this;}

    get_name(){return this.data.username;}
    get_userID(){return this.data.userID;}
    get_message(){return this.data.message;}
    get_playlist(){return this.data.playlist;}
    get_role_list(){return this.data.permission;}
    get_ff14(){return this.data.ff14;}
  
    out_json(){
        return {userName: this.get_name(),
                userID: this.get_userID(),
                message: this.get_message(),
                playlist: this.get_playlist(),
                ff14: this.get_ff14()[1].out_json()};
    }

    in_json(msgs){// msgs is a user {userID:**,message:[],playlist:[],ff14:ff14}
        return new user().set_name(msgs.username)
                         .set_userID(msgs.userID)
                         .set_message(msgs.message)
                         .set_playlist(msgs.playlist)
                         .set_ff14(msgs.ff14);
    }
}

exports.FluentFFlogs = FluentFFlogs;
exports.ff14 = ff14;
exports.user = user;

exports.server_to_server = server_to_server;
exports.server_to_server_region = server_to_server_region;
exports.server_to_data_center = server_to_data_center;
exports.string_is_int=string_is_int;
exports.output_json = output_json;
exports.timeout_send = timeout_send;
exports.user_message_delete = user_message_delete;
exports.help = help;

exports.server_list = server_list;
exports.dc_server = dc_server;
exports.region_dc_servers = region_dc_servers;
exports.data_centers = data_centers;
exports.server_regions = server_regions;