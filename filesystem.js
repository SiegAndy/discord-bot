// const crawler = require("./web_crawler.js");
// const fs = require("fs");
const loadstone = require("./loadstone.js");
const fflogs = require("./fflogs_analysis.js");
const {ff14,user,output_json,timeout_send,server_to_server,server_to_server_region,server_to_data_center} = require('./Classes.js');
const Discord = require('discord.js');

// const portAudio = require('naudiodon');


// need to change: store ID of ff14 character into msgs.json or establish a database with table ff14_info and discord_info
async function embeded_ff14(message, flag=false, character_name="", server=""){
    let character_info = null;
    character_info = await loadstone.find_character(message,flag,character_name,server);

    if(character_info === undefined){return;}
    let ff14_embed = new Discord.MessageEmbed()
								.setColor('#63d6ff')
								.setAuthor(character_info.Name, character_info.Avatar)
								.setTimestamp()
								.setTitle("FF14 Character")
								.addFields(
                                { name: 'Loadstone ID', value: character_info.ID, inline: true },
                                { name: 'FreeCompany', value: character_info.FreeCompanyName, inline: false },
								{ name: 'Server Reigion', value: server_to_server_region(character_info.Server.split('\u00a0')[0]), inline: true },
                                { name: 'Data Center', value: server_to_data_center(character_info.Server.split('\u00a0')[0]), inline: true },
                                { name: 'Server Name', value: character_info.Server.split('\u00a0')[0], inline: true },
                                //{ name: 'Language', value: character_info.Lang, inline: true }
                                )
                                .setImage(character_info.Portrait);
    return ff14_embed;
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
            embed_ff14 = await embeded_ff14(message, true
                                            , client_msgs[message.author.id].ff14.character_name
                                            , client_msgs[message.author.id].ff14.server);
        }
        timeout_send(message, embed);
        if(embed_ff14 === undefined) {return;}
		timeout_send(message, embed_ff14);
    },

    check_rank: async function(message, client_msgs){
        let linked = true;
        let content = message.content.replace("~fflogs",'').split(' ');
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