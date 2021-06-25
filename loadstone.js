
const axios = require('axios');
const Discord = require('discord.js');
const cmds = require('./commands.js');

let loadstone_private_key = `&private_key=${process.env.LOADSTONE_PRIVATE_KEY}`;
function add_private_key(URL) {return URL + loadstone_private_key;};
function timeout_send(message, content, deletetime = 60000){
    setTimeout(function(){message.channel.send(content).then(d_msg => {d_msg.delete({ timeout: deletetime });});}, 10);
}
let server_list = ["Adamantoise","Aegis","Alexander","Anima","Asura","Atomos"
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


module.exports = {
    find_character: async function (message){
        // return character information in format: 
        //{"Avatar":"https:\/\/img2.finalfantasyxiv.com\/f\/df3c8e935f7f3bec0c2bd749d1b132ec_ba22853447012a24cee115315d6a5bebfc0_96x96.jpg?1593186005"
        //,"FeastMatches":0,"ID":25526101,"Lang":"JA\/EN\/DE\/FR","Name":"T'aldarim Annie","Rank":null,"RankIcon":null,"Server":"Sargatanas\u00a0(Aether)"}

        function process(message, responses, character_name, server_name){
            let data = responses.data;
            //console.log(responses)
            if(data.Pagination.ResultsTotal === 1){
                return data.Results[0];
            }
            else{
                if(server_name === undefined){
                    //message.channel.send("need additional parameter to locate exact character. [server]").then(d_msg => {d_msg.delete({ timeout: 60000 });});
                    timeout_send(message, "need additional parameter to locate exact character. [server]");
                    console.log("need additional parameter to locate exact character. [server]");
                    return;
                }
                
                for(result in data.Results){
                    //console.log(`result.Name: ${data.Results[result].Name}, character_name: ${character_name}`);
                    if(data.Results[result].Name.localeCompare(character_name) === 0 ){
                        return data.Results[result];
                    }
                }
            }

            console.log(`No valid character found with name ${character_name} in server ${server_name}`);
            return;
        }

        async function get(message, URL, character_name, server_name){
            try{
                const responses = await axios.get(URL);
                return await process(message, responses, character_name, server_name);
            }
            catch(error){
                console.log(error)
                //console.log("Unknown error happened when retrieving character data.");
            }
        }
        
        let default_URL = "https://xivapi.com/character/search?name=";
        let contents = message.content.replace("~find",'').split(' ').splice(1);
        let character_name = "";
        if(contents.length === 2){
            default_URL = add_private_key(default_URL + contents[0] + "%20" + contents[1]);
            character_name = contents[0] + ' ' + contents[1];
            return await get(message, default_URL, character_name);
        }
        else if(contents.length === 3){
            if(server_list.findIndex((elem)=>elem.toLowerCase() === contents[2].toLowerCase()) === -1){
                console.log("No valid server name detacted in find_character() function.");
                return;
            }
            default_URL = add_private_key(default_URL + contents[0] + "%20" + contents[1] + `&server=${contents[2]}`);
            character_name = contents[0] + ' ' + contents[1];
            let result = await get(message, default_URL, character_name, contents[2]);
            return result;
        }
        else{
            //message.channel.send("Incorrect format!").then(d_msg => {d_msg.delete({ timeout: 60000 });});
            timeout_send(message, "Incorrect format!");
            timeout_send(message, new Discord.MessageEmbed()
                                                .setColor('#99d6ff')
                                                .setTimestamp()
                                                .addFields(
                                                { name: "1): Use command '~Write [content]' to preset message."
                                                , value:"2): Use command '~Get [username]' to read preset message." },
                                                { name: "3): Use command '~fflogs character_firstName character_lastName [combatName] [server_name] ' to get highest rank fflogs."
                                                , value:"		E.g. ~fflogs T'aldarim Annie E5s Sargatanas. combatName and server_name are omitable." },
                                                { name: "4): Use command '~find character_firstName character_lastName [server_name] ' to get ff14 character card."
                                                , value:"		E.g. ~fflogs T'aldarim Annie Sargatanas. "  },
                                                { name: "		server_name is omitable only if no character with duplicate name in other server."
                                                , value:"5): Use command '~whoami' to shows discord user card.(if linked with ff14 character, ff14 character card would also show up.)" },))
            return;
        }
        // console.log(contents);
        // console.log(default_URL);
        
        
    },
}