const axios = require('axios');
const fs = require('fs');
const fs_promises = require('fs').promises;
const filesystem = require('./filesystem.js');
const auto_fflogs = require('./auto_fflogs.js');
const party_member = require('./Data/party_member.json');
const { promisify } = require('util');
const sleep = promisify(setTimeout);



function getProperty(inputObj, target){		
	let names = Object.getOwnPropertyNames(inputObj);
	let values = Object.values(inputObj);
	let index = names.findIndex((input) => input === target);
	if(index === -1){return {found: false, value: -1};}
	else{return {found: true, value: values[index]};}
}

class Success {
    constructor(value) {
      this.kind = 'success';
      this.value = value;
    }
    bool(){
      return true;
    }
    then(f) {
      return f(this.value);
    }
}
  
class Failure {
    constructor(reason) {
      this.kind = 'failure';
      this.reason = reason;
    }
    bool(){
      return false;
    }
    then(f) {
      return this;
    }
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

    let result_array = this.fromEncounter(encounterName);
    if(result_array.length = 0){return new Failure("No fight record fit in this fight: " + encounterName);}


    result_array = result_array.difficulty(difficulty);
    if(difficulty === 100) {difficulty = "normal";}
    else if(difficulty === 101) {difficulty = "savage";}
    else{return new Failure(`error to find fight mode number: ${difficulty}, please choose from 100(normal)/101(savage)!`);}
    if(result_array.length = 0){return new Failure("No fight record fit in this difficulty: " + difficulty);}

    result_array = result_array.highest_percentile();
    if(Object.getOwnPropertyNames(result_array).length === 0){return new Failure("No fight record fit in this condition.");}
    if(Object.getOwnPropertyNames(result_array).length > 19){return new Failure("Error happened in highest_percentile, more porperties appeared.");}
    if(result_array.percentile === -1){return new Failure("Character: " + result_array.characterName + ", has no record fit in this fight: " + encounterName + ", in this difficulty: " + difficulty);}
    
    return new Success([result_array.characterName, result_array.spec, encounterName, difficulty, Math.round(result_array.percentile).toString(), result_array.total.toString()]);
  }
  
  print(){
    this.data.forEach(element => console.log(element));
  }

}






function update_user_info(info){// input a success or failur type object
  //console.log(info)  
  if(info[0] === undefined){
      
        if(info.then().length === 0){
            message.channel.send("Unkown error, error didn't send out from process.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
        }
        //message.channel.send(info.then()).then(d_msg => {d_msg.delete(60000);});
        return info;
    }
    return info; //[server_region, server, character_name]
}

function slice_empty(input_message, variables){
    let inner = input_message;
    if(inner.indexOf(' ') === -1){
        variables.push(input_message);
        return variables;
      }
    let new_variable = inner.slice(0,inner.indexOf(' '));
    variables.push(new_variable)
    return slice_empty(inner.slice(inner.indexOf(' ')+1), variables);
}

function find_combat_zone(combatName){
    switch(combatName){
        case 'e5':return ["Ramuh",100];
        case 'e5s':return ["Ramuh",101];
        case 'e6':return ["Ifrit and Garuda",100];
        case 'e6s':return ["Ifrit and Garuda",101];
        case 'e7':return ["The Idol of Darkness",100];
        case 'e7s':return ["The Idol of Darkness",101];
        case 'e8':return ["Shiva",100];
        case 'e8s':return ["Shiva",101];
        case 'e9':return ["Cloud of Darkness",100];
        case 'e9s':return ["Cloud of Darkness",101];
        case 'e10':return ["Shadowkeeper",100];
        case 'e10s':return ["Shadowkeeper",101];
        case 'e11':return ["Fatebreaker",100];
        case 'e11s':return ["Fatebreaker",101];
        case 'e12':return ["Eden's Promise",100];
        case 'e12s':return ["Oracle of Darkness",101];
        default: return ["error",-1];				
    }
}
function incorrect_format(message){
    message.channel.send("Incorrect format").then(d_msg => {d_msg.delete({ timeout: 60000 });});
    message.channel.send("Use command '~fflogs [character_firstName] [character_lastName] [combatName] [server_name] ' to get highest rank fflogs.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
    message.channel.send("		E.g. ~fflogs T'aldarim Annie E5s Sargatanas. combatName and server_name are omitable.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
}


function inner_process(message, responses, server, combat_zone){
    if(combat_zone.length !== 2){message.channel.send("Error expression in find_combat_zone(), output error").then(d_msg => {d_msg.delete({ timeout: 60000 });});return;}
    if(combat_zone[1] === -1){message.channel.send("Error expression in find_combat_zone(), can't find correspond fight.").then(d_msg => {d_msg.delete({ timeout: 60000 });});return;}
    let result = new FluentFFlogs(responses.data).print_highest_percentile(combat_zone[0], combat_zone[1]);
    if(result.bool() || (!result.bool() && !has_fight)){
        //`Character: " + result_array.characterName + ", with Role: " + result_array.spec 
        //+ ", in Fight: " + encounterName + ", with Mode: " + difficulty 
        //+ ", has Highest Ranking: " + Math.round(result_array.percentile).toString() 
        //+ ", with Total DPS: " + result_array.total.toString()`
        let result_array = result.then((elem)=>elem);
        message.channel.send(`Character: ${result_array[0]}, with Role: ${result_array[1]}, in Fight: ${result_array[2]} , with Mode: ${result_array[3]}, has Highest Ranking: ${result_array[4]}, with Total DPS: ${result_array[5]}`)
                       .then(d_msg => {d_msg.delete({ timeout: 120000 });});
        return new Success(["NA", server, result_array[0]]);
    }
    else{
      message.channel.send(result.then()).then(d_msg => {d_msg.delete({ timeout: 60000 });});
    }

}


async function get_content_has_server(message, combat_zone, server, URL){
    try{
        const responses = await axios.get(URL);
        return inner_process(message, responses, server, combat_zone);
    }
    catch(error){
        //console.log(error)
        incorrect_format(message);
    }
    return new Failure("unknown error happened in get_content_has_server() async function.");
}

async function get_content(message, combat_zone, server, URL){
    try{
        const responses = await axios.get(URL);
        //console.log(server)
        
        message.channel.send("**").then(d_msg => {d_msg.delete({ timeout: 120000 });});

        message.channel.send("Find Character in Server: " + server).then(d_msg => {d_msg.delete({ timeout: 120000 });});
        return inner_process(message, responses, server, combat_zone);
        //message.channel.send("**").then(d_msg => {d_msg.delete({ timeout: 60000 });});
    }
    catch(error){
        //message.channel.send("**").then(d_msg => {d_msg.delete({ timeout: 60000 });});
        //message.channel.send("Can't find Character in Server: " + server).then(d_msg => {d_msg.delete({ timeout: 60000 });});
        ;//message.channel.send("**").then(d_msg => {d_msg.delete({ timeout: 60000 });});
    }
    return new Failure("unknown error happened in get_content() async function.");
}

async function iterate_combat_zone(message, combats, server, URL){ //iterate each possible combat zone
    let combat_zone = [];
    for(let i = 0; i < combats.length; ++i){
        combat_zone = find_combat_zone(combats[i]);
        return await get_content(message, combat_zone, server, URL).then((elem)=>elem);
    }
}
async function combat_server(message, has_server, has_fight, server, combatName, URL){ // check if input have fight and server
    let combats = ["e5", "e5s","e6","e6s","e7","e7s","e8","e8s"];	
    if(has_server){
        if(has_fight){
            return await get_content_has_server(message, find_combat_zone(combatName.toLowerCase()), server, URL);
            
        }
        else{
            return iterate_combat_zone(message, combats, server, URL);
        }
    }
    else{
        if(has_fight){
            return await get_content(message, find_combat_zone(combatName.toLowerCase()), server, URL).then((elem)=>elem);
        }
        else{
            return iterate_combat_zone(message, combats, server, URL);
        }
    }
    
}

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









module.exports = {

  check_rank_onlyCombatName: async function (message, serverRegion,server_name,character_name,combatName){
    inner_check_rank(message, serverRegion,server_name,character_name,combatName);
  },

  check_rank: async function (message){
        let default_URL = "https://www.fflogs.com/v1/parses/character";

        //new attributes
        let original = message.content.slice(8); // get attributes String
        let variables = [];
        variables = slice_empty(original, variables);
        let character_firstName = "";
        let character_lastName = "";
        let combatName = "";
        let server_name = "";
        let format = true;
        let has_fight = false;
        let has_server = false;

        switch(variables.length){
            case 2:
                message.channel.send("Currently, this service is testing. Errors are expected.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
                character_firstName = variables[0];
                character_lastName = variables[1];
                break;
            case 3:
                character_firstName = variables[0];
                character_lastName = variables[1];
                combatName = variables[2];
                has_fight = true;
                break;
            case 4:
                character_firstName = variables[0];
                character_lastName = variables[1];
                combatName = variables[2];
                server_name = variables[3];
                has_fight = true;
                has_server = true;
                break;
            default:
                incorrect_format(message);
                format = false;
                break;
        }

        //preset attributes
        let api_key = "&api_key=60cf5fc24a60225a8d6e343ba3f31a21";
        let serverRegion = "/NA";
        let metric = "?metric=dps";
        let bracket = "&bracket=0";
        let compare = "&compare=0";
        let timeframe = "&timeframe=historical"; // historical/today

        //let default_URL = "https://www.fflogs.com/v1/parses/character/{characterName}/{serverName}/{serverRegion}"
                
        //combatName = "E5s";

        //URL = "https://www.fflogs.com/v1/parses/character/T%27aldarim%20Annie/Jenova/NA?metric=dps&bracket=0&compare=0&timeframe=historical&api_key=60cf5fc24a60225a8d6e343ba3f31a21";

        let data = [undefined, undefined, undefined];
        if(has_server){		
            let URL = default_URL + "/" + character_firstName + "%20" + character_lastName + "/" + server_name + serverRegion + metric + bracket + compare + timeframe + api_key;
            //console.log(URL)
            let info = await combat_server(message, has_server, has_fight, server_name, combatName, URL);
            //if(info === undefined){message.channel.send("Unknown error when retrieving Character information.").then(d_msg => {d_msg.delete({ timeout: 60000 });}); return data;}
            if(info[0] !== undefined){data = info;}
        }
        else{
            let servers = ["Adamantoise", "Cactuar", "Faerie", "Gilgamesh", "Jenova", "Midgardsormr", "Sargatanas", "Siren"];
            let i = 0;
            while(i < servers.length){
                let URL = default_URL + "/" + character_firstName + "%20" + character_lastName + "/" + servers[i] + serverRegion + metric + bracket + compare + timeframe + api_key;
                message.channel.send("Searching Server: " + servers[i]).then(d_msg => {d_msg.delete({ timeout: 60000 });});
                
                let info = await combat_server(message, has_server, has_fight, servers[i], combatName, URL);
                //if(info === undefined){message.channel.send("Unknown error when retrieving Character information.").then(d_msg => {d_msg.delete({ timeout: 60000 });}); return data;}
                if(info[0] !== undefined){data = info;}
                ++i;
            }
    
        }
        return data;

    },
  
  auto_check_party_member: function (message){
    get_members(message);
  },
    
}