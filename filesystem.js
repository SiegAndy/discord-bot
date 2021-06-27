const loadstone = require("./loadstone.js");
const crawler = require("./web_crawler.js");
const fflogs = require("./fflogs_analysis_new.js");
const Discord = require('discord.js');
const fs = require("fs");
// const portAudio = require('naudiodon');

class protect{
    constructor(init){
      this.current = this.memo(init);
    }
    memo(init){
      let r = {value: init}
      return {
        get: () => r.value,
        set: function(new_value){r.value = new_value}
      }
    }
    setter(new_value){
      this.current.set(new_value);
      return this;
    }
    getter(){
      return this.current.get();
    }
}
  
class ff14{
    constructor(){
        this.server_region = undefined;
        this.data_center = undefined;
        this.server = undefined; 
        this.character_name = undefined;
        this.character_id = undefined;
        this.character_avatar = undefined;
    }
    set_character_name(input){this.character_name = input; return this;}
    set_character_id(input){this.character_id = input; return this;}
    set_character_avatar(input){this.character_avatar = input; return this;}
    set_server_region(input){this.server_region = input; return this;}
    set_data_center(input){this.data_center = input; return this;}
    set_server(input){this.server = input; return this;}
  
    get_character_name(){return this.character_name;}
    get_character_id(){return this.character_id;}
    get_character_avatar(){return this.character_avatar;}
    get_server_region(){return this.server_region;}
    get_data_center(){return this.data_center;}
    get_server(){return this.server;}
    
    out_json(){
        return {server_region: this.server_region,
                data_center: this.data_center,
                server: this.server,
                character_name: this.character_name,
                character_id: this.character_id,
                character_avatar: this.character_avatar,}
    }

    in_json(msgs){// {data_center:**, server:**,character_name:**}
        return new ff14().set_character_name(msgs.character_name).set_character_id(msgs.character_id).set_character_avatar(msgs.character_avatar)
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

function output_json(message, client_msgs, output_msgs){
    //console.log(client_msgs)
    fs.writeFile ("./msgs.json", JSON.stringify (client_msgs, null, 4), err =>{
        if(err) throw err;
        message.reply(output_msgs).then(d_msg => {d_msg.delete({ timeout: 100000 });});
    });
}

function read_message(message, client_msgs, userName){
    if(client_msgs[message.author.id] === undefined){
        message.reply("Invalid input: unknown userID.").then(d_msg => {d_msg.delete({ timeout: 30000 });});
        client_msgs[message.author.id] = new user().set_name(userName).set_userID(message.author.id).out_json();
        //write_message(message, client_msgs, "Welcome to use Discord_bot", 2);
        output_json(message, client_msgs, "New user added.");
    }
    else{
        let _message = client_msgs[message.author.id].message;
        message.reply(userName + " leaves message: ").then(d_msg => {d_msg.delete({ timeout: 120000 });});
        for(let i = 0; i < _message.length; ++i){
            message.reply((i+1).toString() + " : " + _message[i]).then(d_msg => {d_msg.delete({ timeout: 120000 });});
        }
    }
}

function timeout_send(message, content, deletetime = 60000){
    setTimeout(function(){message.channel.send(content).then(d_msg => {d_msg.delete({ timeout: deletetime });});}
    , 10);
}

//function write_message(message, client_msgs, inner_message, index){// index = 1 means ~write, index = 2 means user creation using write_message for welcome message
function write_message(message, client_msgs){
    let editMessage = "";
    if (index === 1){
        editMessage = message.content.replace("~write",'').split(' ');
        message.delete({ timeout: 10000 }).then(msg => console.log(`Deleted 'Write' message from ${msg.author.username}`)).catch(console.error); 
    }
    else if(index === 2){
        editMessage = inner_message;
    }

    if(client_msgs[message.author.id] === undefined || client_msgs[message.author.id].message === undefined){
        client_msgs[message.author.id] = new user().set_name(message.author.username).set_userID(message.author.id).set_message(editMessage[1]).out_json();
    }
    else{
        var content = client_msgs[message.author.id].message;
        //console.log(client_msgs[message.author.username])
        content.push(editMessage[1]);
        client_msgs[message.author.id].message = content;
    }
    output_json(message, client_msgs, "Message Writen.");
}

function server_to_server(server_name){// lowercased serve name into uppercased server name
    return server_name.slice(0,1).toUpperCase()+server_name.slice(1);
}

function server_to_server_region(server_name){
    //console.log(server_name)
    let region_dc_servers = {NA:{Aether:["Adamantoise","Cactuar","Faerie","Gilgamesh","Jenova","Midgardsormr","Sargatanas","Siren"]
                                 ,Crystal:["Balmung","Brynhildr","Coeurl","Diabolos","Goblin","Malboro","Mateus","Zalera"]
                                 ,Primal:["Behemoth","Excalibur","Exodus","Famfrit","Hyperion","Lamia","Leviathan","Ultros"]}
                            ,EU:{Chaos:["Cerberus","Louisoix","Moogle","Omega","Ragnarok","Spriggan"]
                                  ,Light:["Lich","Odin","Phoenix","Shiva","Zodiark","Twintania"]}
                            ,JP:{Elemental:["Aegis","Atomos","Carbuncle","Garuda","Gungnir","Kujata","Ramuh","Tonberry","Typhon","Unicorn"]
                                  ,Gaia:["Alexander","Bahamut","Durandal","Fenrir","Ifrit","Ridill","Tiamat","Ultima","Valefor","Yojimbo","Zeromus"]
                                  ,Mana:["Anima","Asura","Belias","Chocobo","Hades","Ixion","Mandragora","Masamune","Pandaemonium","Shinryu","Titan"]}}
    let server_regions = ["NA","EU","JP"];
    let data_centers = ["Aether","Chaos","Crystal","Elemental","Gaia","Light","Mana","Primal"]
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
    let dc_server = {Aether:["Adamantoise","Cactuar","Faerie","Gilgamesh","Jenova","Midgardsormr","Sargatanas","Siren"]
                        ,Chaos:["Cerberus","Louisoix","Moogle","Omega","Ragnarok","Spriggan"]
                        ,Crystal:["Balmung","Brynhildr","Coeurl","Diabolos","Goblin","Malboro","Mateus","Zalera"]
                        ,Elemental:["Aegis","Atomos","Carbuncle","Garuda","Gungnir","Kujata","Ramuh","Tonberry","Typhon","Unicorn"]
                        ,Gaia:["Alexander","Bahamut","Durandal","Fenrir","Ifrit","Ridill","Tiamat","Ultima","Valefor","Yojimbo","Zeromus"]
                        ,Light:["Lich","Odin","Phoenix","Shiva","Zodiark","Twintania"]
                        ,Mana:["Anima","Asura","Belias","Chocobo","Hades","Ixion","Mandragora","Masamune","Pandaemonium","Shinryu","Titan"]
                        ,Primal:["Behemoth","Excalibur","Exodus","Famfrit","Hyperion","Lamia","Leviathan","Ultros"]}
    let data_centers = ["Aether","Chaos","Crystal","Elemental","Gaia","Light","Mana","Primal"]
    for(data_center in data_centers){ 
        if(dc_server[data_centers[data_center]].findIndex((server) => server.localeCompare(server_to_server(server_name)) === 0) !== -1){
            return data_centers[data_center];
        }
    }
    console.log("Unkown input server_name from server_to_data_center().")
    return;
}

// need to change: store ID of ff14 character into msgs.json or establish a database with table ff14_info and discord_info
async function embeded_ff14(message){
    let character_info = await loadstone.find_character(message);
    if(character_info === undefined){return;}
    let character_image = await crawler.loadstone_character_pic(character_info.ID)
    if(character_image === undefined){return;}
    let ff14_embed = new Discord.MessageEmbed()
								.setColor('#63d6ff')
								.setAuthor(character_info.Name,character_info.Avatar)
								.setTimestamp()
								.setTitle("FF14 Character")
								.addFields({ name: 'Loadstone ID', value: character_info.ID, inline: true },
								{ name: 'Server Reigion', value: server_to_server_region(character_info.Server.split('\u00a0')[0]), inline: true },
                                { name: 'Data Center', value: server_to_data_center(character_info.Server.split('\u00a0')[0]), inline: true },
                                { name: 'Server Name', value: character_info.Server.split('\u00a0')[0], inline: true },
                                { name: 'Language', value: character_info.Lang, inline: true })
                                .setImage(character_image);
    return ff14_embed;
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

let roleNames = {max: ['GM', 'Administrator',], second: ['GM', 'Administrator','Refugee','Tester',]};
const sampleRate = 48000;
let  audioDeviceId = null; //4 is virtual cable; 2 is voicemeeter
// let portInfo = portAudio.getHostAPIs();
// let defaultDeviceId = portInfo.HostAPIs[portInfo.defaultHostAPI].defaultOutput;
// let defaultDevice = portAudio.getDevices().filter(device => device.id === defaultDeviceId);
let ai = null;
let voiceChannel = null;
let isActive = false;
let stream = new require('stream').Transform()
stream._transform = function (chunk, encoding, done) {
  this.push(chunk);
  done();
}



module.exports = {
    card: async function(message, client_msgs){
        if(client_msgs[message.author.id] === undefined){
            client_msgs[message.author.id] = new user().set_name(message.author.username).set_userID(message.author.id).out_json();
            //console.log(client_msgs);
            //write_message(message, client_msgs, "Welcome to use Discord_bot", 2);
            output_json(message, client_msgs, "New user added.");
        }
        let ff14_character = "No character Linked";
        if(client_msgs[message.author.id].ff14.character_name !== undefined){ff14_character = client_msgs[message.author.id].ff14.character_name}
        let embed_ff14 = undefined;
        let embed = new Discord.MessageEmbed()
								.setColor('#63d6ff')
								.setAuthor(message.author.tag,message.author.displayAvatarURL())
								.setTimestamp()
								.setTitle("Discord Card")
								.addFields({ name: 'Username', value: message.author.username },
								{ name: 'User ID', value: message.author.id, inline: true },
                                { name: 'FF14 Character', value: ff14_character, inline: true },);
                                
        if(client_msgs[message.author.id].ff14.character_name !== undefined){
            let new_message = message;
            new_message.content = `~find ${client_msgs[message.author.id].ff14.character_name} ${client_msgs[message.author.id].ff14.server}`;
            embed_ff14 = await embeded_ff14(new_message);
        }
        timeout_send(message, embed);
        if(embed_ff14 === undefined) {return;}
		timeout_send(message, embed_ff14);
    },

    write_message: write_message,

    get_message_name: function(message, client_msgs){
        let userName = message.content.replace("~get",'').split(' ');
        userName = userName[1];
		message.delete({ timeout: 10000 }).then(msg => console.log(`Deleted message from ${msg.author.username}`)).catch(console.error);
		read_message(message, client_msgs, userName);
    },

    get_message: function(message, client_msgs){
        let userName = message.author.username;
		message.delete({ timeout: 10000 }).then(msg => console.log(`Deleted message from ${msg.author.username}`)).catch(console.error);
        read_message(message, client_msgs, userName);
    },

    remove_message: function(message, client_msgs, index){
        let userID = message.author.id;
        message.delete({ timeout: 10000 }).then(msg => console.log(`Deleted message from ${msg.author.username}`)).catch(console.error);

        if(client_msgs[message.author.id] === undefined){
            message.reply("Invalid input: unknown userID.").then(d_msg => {d_msg.delete({ timeout: 300000 });});
            client_msgs[message.author.id] = new user().set_name(message.author.username).set_userID(message.author.id).out_json();
            //write_message(message, client_msgs, "Welcome to use Discord_bot", 2);
            output_json(message, client_msgs, "New user added.");
		}
		else{
			let _message = client_msgs[userID].message;
            _message = _message.splice(index-1,1);
            client_msgs[userID].message = _message;
            output_json(message, client_msgs, "message [" + index.toString() + "] removed.");
        }        
    },

    check_rank: async function(message, client_msgs){
        let linked = true;
        let content = message.content.replace("~fflogs",'').split(' ');
        message.delete({ timeout: 10000 }).then(msg => console.log(`Deleted message from ${msg.author.username}`)).catch(console.error);
        let new_user = undefined;
        let result = undefined;
        
        if(client_msgs[message.author.id] === undefined || client_msgs[message.author.id].message === undefined){
            linked = false;
            new_user = new user().set_name(message.author.username).set_userID(message.author.id);
            //write_message(message, client_msgs, "Welcome to use Discord_bot", 2);
            client_msgs[message.author.id] = new_user.out_json();
            output_json(message, client_msgs, "New user added.");
            result = await fflogs.check_rank(message);
        }
        else {
            if(client_msgs[message.author.id].ff14.character_name === undefined){linked = false;}
            new_user = new user().in_json(client_msgs[message.author.id]);
            if(client_msgs[message.author.id].ff14.character_name !== undefined && content.length === 2){
                    //we have character name, server, data center, ['',combatname]
                    let ff14_attrs = client_msgs[message.author.id].ff14;
                    result = await fflogs.check_rank_onlyCombatName(message, ff14_attrs.server_region,ff14_attrs.server,ff14_attrs.character_name,content[1]);
            }
            else{
                result = await fflogs.check_rank(message);
            }
        }
        
        if (result === undefined || result[0] === undefined){console.log("Result pulled from fflogs is undefined.");return;}
        if(!linked){
            let new_ffer = new ff14().set_character_name(result[2]).set_server(server_to_server(result[1])).set_data_center(server_to_data_center(result[1])).set_server_region(result[0]);
            new_user.set_ff14(new_ffer);
            
            client_msgs[message.author.id] = new_user.out_json();
        
            output_json(message, client_msgs, `Character: ${result[2]} linked with User: ${message.author.username} and ID: ${message.author.id}`);
        }
    },

    //for user-use to display character information
    find_character: async function(message){
        let result = await embeded_ff14(message);
        if(result === undefined) {return;}
		timeout_send(message, result);
    },

    server_to_server_region: server_to_server_region,

    server_to_data_center: server_to_data_center,

    auto_check_party_member: function (message){fflogs.auto_check_party_member(message);},

    // local_relay: async function(message){
    //     console.log("=====================================================")
    //     if (!message.guild) return;
    //     if (message.author.bot) return;
    //     //audioDeviceId 4 is virtual cable; 2 is voicemeeter
    //     voiceChannel = message.member.voice.channel;      
        
    //     if(!isEligible(message,2)){return;}
    //     if(message.content.length <= 8){
    //         if (!voiceChannel) {message.reply('Please join a VoiceChannel first, then summon me.');return;}
    //         if(isActive){message.reply('I am already in a voice channel, please disconnect first then summon me.');return;}
    //         else if(!isActive){
    //             isActive = true;
    //             // Only try to join the sender's voice channel if they are in one themselves
    //             message.reply('At your service.');
    //             if(message.content.substring(7) === '1'){audioDeviceId = 1;}
    //             else if(message.content.substring(7) === '2'){audioDeviceId = 2;}
    //             else if(message.content.substring(7) === '3'){audioDeviceId = 3;}
    //             else if(message.content.substring(7) === '4'){audioDeviceId = 4;}
    //             else if(message.content.substring(7) === '5'){audioDeviceId = 5;}
    //             voiceChannel.join()
    //             .then(connection => {
    //             ai = new portAudio.AudioIO({
    //                 inOptions: {
    //                 channelCount: 2,
    //                 sampleFormat: portAudio.SampleFormat16Bit,
    //                 sampleRate: sampleRate,
    //                 deviceId: audioDeviceId !== null ? audioDeviceId : defaultDevice.id // Use -1 or omit the deviceId to select the default device
    //                 //deviceId: 2
    //                 }
    //             });
    //             // pipe the audio input into the transform stream and
    //             ai.pipe(stream);
    //             // the transform stream into the discord voice channel
    //             const dispatcher = connection.play(stream, {type: 'converted'});
    //             // start audio capturing
    //             ai.start();
                
            
    //             dispatcher.on('debug', (info) => console.log(info));
    //             dispatcher.on('end', () => voiceChannel.leave());
    //             dispatcher.on('error', (error) => console.log(error));
        
    //             })
    //             .catch(error => {
    //             console.log(error);
    //             message.reply(`Cannot join VoiceChannel, because ${error.message}`);
    //             isActive = false;
    //             });
    //         }      
    //     }
    //     // leave the channel
    //     else if (message.content ==='~relay quit') {
    //         if(!isActive){await message.reply(`I am not in the voice channel currently.`); return;}  
    //         voiceChannel.leave();
    //         isActive = false;
    //         message.reply('Leaving!');
    //         voiceChannel = undefined;
    //         ai.quit();
    //         ai.unpipe(stream);
    //     }
    //     else{message.reply(`Unknown input "${message.content}".`); return;}
    // }
    
}