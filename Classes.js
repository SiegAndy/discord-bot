
const Discord = require('discord.js');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const webhooks = [ 'https://discord.com/api/webhooks/861092339198722058/zq9CrwrbQPhsB8y-hXQthDq7AWI_F9w8ToRGboCfQSZJvKk5E4shZ27IJ5dQJBtqr18u',
                  //'https://discord.com/api/webhooks/860982441521709066/xSqqdfqgIG0r_Ir-ghyehMiEYBvWHmO8qoBA-iIbHnKtudKjB0_JB_VWqQcsEzed0AhH',
                ]
const roleNames = {max: ['GM', 'Administrator',], second: ['GM', 'Administrator','Refugee','Tester',]};

const server_regions = ["NA","EU","JP"];

const data_centers = ["Aether","Chaos","Crystal","Elemental","Gaia","Light","Mana","Primal"]

const region_dc = {NA:['Aether','Crystal','Primal'],
                    EU:['Chaos','Light'],
                    JP:['Elemental','Gaia','Mana']
                  }

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

//Ultimates 4.0
const zone_30 = {
  "id": 30,
    "name": "Ultimates (Stormblood)",
    "frozen": false,
    "encounters": [
      {
        "id": 1047,
        "name": "The Unending Coil of Bahamut"
      },
      {
        "id": 1048,
        "name": `    The Weapon's Refrain    `
      }
    ],
    "brackets": {
      "min": 5,
      "max": 5.5,
      "bucket": 0.1,
      "type": "Patch"
    },
    "partitions": [
      {
        "name": "Standard Comps",
        "compact": "Standard",
        "area": 1,
        "default": true
      },
      {
        "name": "Non-Standard Comps",
        "compact": "Non-Standard",
        "area": 1
      },
      {
        "name": "Standard Comps",
        "compact": "Standard",
        "default": true,
        "area": 2
      },
      {
        "name": "Non-Standard Comps",
        "compact": "Non-Standard",
        "area": 2
      },
      {
        "name": "Standard Comps",
        "compact": "Standard",
        "default": true,
        "area": 3
      },
      {
        "name": "Non-Standard Comps",
        "compact": "Non-Standard",
        "area": 3
      }
    ]
}

//Ultimates 5.0
const zone_32 = {
  "id": 32,
  "name": "Ultimates",
  "frozen": false,
  "encounters": [
    {
      "id": 1050,
      "name": "    The Epic of Alexander   "
    }
  ],
  "brackets": {
    "min": 5,
    "max": 5.5,
    "bucket": 0.1,
    "type": "Patch"
  },
  "partitions": [
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "area": 1,
      "filtered_name": "5.1-5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 1
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "area": 2,
      "filtered_name": "5.1-5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 2
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "area": 3,
      "filtered_name": "5.1-5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 3
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 1
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 1
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 2
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 3
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 3
    },
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 1
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 1
    },
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 2
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 3
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 3
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 1,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5)",
      "area": 1
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 2,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 3,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5)",
      "area": 3
    }
  ]
}

//Ultimates 6.0
const zone_43 = {
  "id": 43,
  "name": "Ultimates",
  "frozen": false,
  "encounters": [
    {
      "id": 1060,
      "name": "The Unending Coil of Bahamut"
    },
    {
      "id": 1061,
      "name": "    The Weapon's Refrain    "
    },
    {
      "id": 1062,
      "name": "    The Epic of Alexander   "
    }
  ],
  "brackets": {
    "min": 6,
    "max": 6,
    "bucket": 0.1,
    "type": "Patch"
  },
  "partitions": [
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "area": 1,
      "default": true
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 1
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "default": true,
      "area": 2
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 2
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "default": true,
      "area": 3
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 3
    }
  ]
}

//E5-E8
const zone_33 = {
  "id": 33,
  "name": "Eden's Verse",
  "frozen": false,
  "encounters": [
    {
      "id": 69,
      "name": "Ramuh"
    },
    {
      "id": 70,
      "name": "Ifrit and Garuda"
    },
    {
      "id": 71,
      "name": "The Idol of Darkness"
    },
    {
      "id": 72,
      "name": "Shiva"
    }
  ],
  "brackets": {
    "min": 5,
    "max": 5.5,
    "bucket": 0.1,
    "type": "Patch"
  },
  "partitions": [
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "area": 1,
      "default": true,
      "filtered_name": "5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 1
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "default": true,
      "area": 2,
      "filtered_name": "5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 2
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "default": true,
      "area": 3,
      "filtered_name": "5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 3
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 1
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 1
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 2
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 3
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 3
    }
  ]
}

//E9-E12
const zone_38 = {
  "id": 38,
  "name": "Eden's Promise",
  "frozen": false,
  "encounters": [
    {
      "id": 73,
      "name": ` Cloud of Darkness`
    },
    {
      "id": 74,
      "name": `   Shadowkeeper   `
    },
    {
      "id": 75,
      "name": `    Fatebreaker   `
    },
    {
      "id": 76,
      "name": `  Eden's Promise  `
    },
    {
      "id": 77,
      "name": `Oracle of Darkness`
    }
  ],
  "brackets": {
    "min": 5,
    "max": 5.5,
    "bucket": 0.1,
    "type": "Patch"
  },
  "partitions": [
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 1
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 1
    },
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 2,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 3,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 3
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 1,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5",
      "area": 1
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 2
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 3
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5)",
      "area": 3
    },
    {
      "name": "Standard Comps (Echo)",
      "compact": "Standard (Echo)",
      "filtered_name": "Echo",
      "area": 1
    },
    {
      "name": "Non-Standard Comps (Echo)",
      "compact": "Non-Standard (Echo)",
      "area": 1
    },
    {
      "name": "Standard Comps (Echo)",
      "compact": "Standard (Echo)",
      "filtered_name": "Echo",
      "area": 2
    },
    {
      "name": "Non-Standard Comps (Echo)",
      "compact": "Non-Standard (Echo)",
      "area": 2
    },
    {
      "name": "Standard Comps (Echo)",
      "compact": "Standard (Echo)",
      "filtered_name": "Echo",
      "area": 3
    },
    {
      "name": "Non-Standard Comps (Echo)",
      "compact": "Non-Standard (Echo)",
      "area": 3
    }
  ]
}

//P1-P4
const zone_44 = {"id": 44,
"name": "Asphodelos",
"frozen": false,
"encounters": [
  {
    "id": 78,
    "name": "   Erichthonios  "
  },
  {
    "id": 79,
    "name": "   Hippokampos   "
  },
  {
    "id": 80,
    "name": "     Phoinix     "
  },
  {
    "id": 81,
    "name": "     Hesperos    "
  },
  {
    "id": 82,
    "name": "    Hesperos II  "
  }
],
"brackets": {
  "min": 6,
  "max": 6,
  "bucket": 0.1,
  "type": "Patch"
},
"partitions": [
  {
    "name": "Standard Comps",
    "compact": "Standard",
    "area": 1,
    "default": true
  },
  {
    "name": "Non-Standard Comps",
    "compact": "Non-Standard",
    "area": 1
  },
  {
    "name": "Standard Comps",
    "compact": "Standard",
    "default": true,
    "area": 2
  },
  {
    "name": "Non-Standard Comps",
    "compact": "Non-Standard",
    "area": 2
  },
  {
    "name": "Standard Comps",
    "compact": "Standard",
    "default": true,
    "area": 3
  },
  {
    "name": "Non-Standard Comps",
    "compact": "Non-Standard",
    "area": 3
  }
]
}

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

function timeout_send(message, content, deletetime = 60000){
    console.log(content)
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
          else if(target_value <= orginal_value){//if new one have lower rating return new one
            return acc;
          }
          else{console.log("Error in percentile field");}
        }
        }
      },{percentile: -1});
      return result_array;
    }
  
    print_highest_percentile(encounter, difficulty){
      let root = this;
      return new Promise(async function(resolve, rejects){
        let result_array = root.fromEncounter(encounter.encounterName);
        if(result_array.length = 0){rejects(`No fight record fit in this fight: ${encounter.encounterName}`);}
  
        result_array = result_array.difficulty(difficulty);
        if(difficulty === 100) {difficulty = "normal";}
        else if(difficulty === 101) {difficulty = "savage";}
        else{rejects(`error to find fight mode number: ${difficulty}, please choose from 100(normal)/101(savage)!`);}
        if(result_array.length = 0){rejects(`No fight record fit in this difficulty: ${difficulty}`);}
  
        result_array = result_array.highest_percentile();
        if(Object.getOwnPropertyNames(result_array).length === 0){rejects("No fight record fit in this condition.");}
        if(Object.getOwnPropertyNames(result_array).length > 19){rejects("Error happened in highest_percentile, more porperties appeared.");}
        if(result_array.percentile === -1){rejects(`Character: ${result_array.characterName}, has no record fit in this fight: ${encounter.encounterName}, in this difficulty: ${difficulty}`);}
        // console.log(result_array)
        return resolve({
                  characterName: result_array.characterName, 
                  spec:result_array.spec, 
                  fight: encounter.encounterName, 
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
exports.get_icon_url = get_icon_url;
exports.isEligible = isEligible;

exports.webhooks = webhooks;
exports.server_list = server_list;
exports.dc_server = dc_server;
exports.region_dc = region_dc;
exports.region_dc_servers = region_dc_servers;
exports.data_centers = data_centers;
exports.server_regions = server_regions;
exports.zone_30 = zone_30;
exports.zone_32 = zone_32;
exports.zone_43 = zone_43;
exports.zone_33 = zone_33;
exports.zone_38 = zone_38;
exports.zone_44 = zone_44;