// const crawler = require("./web_crawler.js");
// const fs = require("fs");
const loadstone = require("./loadstone.js");
const fflogs = require("./fflogs_analysis.js");
const {Database} = require('./Database/Database_postgre.js');
const {ff14,user,output_json,timeout_send,server_to_server,server_to_server_region,server_to_data_center} = require('./Classes.js');
const Discord = require('discord.js');


// need to change: store ID of ff14 character into msgs.json or establish a database with table ff14_info and discord_info
async function embeded_ff14(message, flag=false, character_name="", server=""){
    let character_info = null;
    try {
        character_info = await loadstone.find_character(message,flag,-1,character_name,server);
    } catch (error) {
        timeout_send(message, error);
        console.log(message, error);
    }   

    if(character_info === null){return;}
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


module.exports = {
    create_user: async function(message){
        const pool = new Database();
        //~create [discord_id] [discord_username] [privilege] [lodestone]
        //~create 483897747137626116 SiegAndy 3 25526101
        function warning_helper(input){
            return new Promise(async function(resolve, rejects){                           
                if(!Number.isInteger(input)){
                    rejects("Please enter a valid discord id (integer)!");                   
                }
                resolve("Success");
            });
        }       
        
        let content = message.content.replace("~create",'').split(' ').slice(1);
        
        try {
            if(content.length === 0){//~create
                await pool.insert(message.author.id, message.author.username);
                timeout_send(message, `Thank you for using this bot!\nNew user ${message.author.username} added.`);
            }
            else if(content.length > 0 && content.length < 5){
                //await warning_helper(content[0]);
                let username;
                if(content.length === 1){//~create [privilege]
                    username = message.author.username;
                    await pool.insert(message.author.id, message.author.username, parseInt(content[0]));
                }
                else if(content.length === 2){//~create [discord_id] [discord_username]
                    username = content[1];
                    await pool.insert(content[0], content[1]);
                }
                else if(content.length === 3){//~create [discord_id] [discord_username] [privilege]
                    username = content[1];
                    await pool.insert(content[0], content[1], parseInt(content[2]));
                }           
                else if(content.length === 4){//~create [discord_id] [discord_username] [privilege] [lodestone]
                    //console.log(content)
                    let character_info = await loadstone.find_character(message,true, parseInt(content[3]));
                    username = content[1] + " with ff14 character: " + character_info.Name;
                    // console.log(character_info)
                    await pool.insert(content[0], content[1], parseInt(content[2]), parseInt(content[3])
                        , character_info.Name.split(' ')[0], character_info.Name.split(' ')[1], character_info.Server
                        , server_to_data_center(character_info.Server), server_to_server_region(character_info.Server));
                }     
                timeout_send(message, `Thank you for using this bot!\nNew user: ${username} added.`);
            }
            else{
                throw `More than 4 arguments accepted ${content}, invalid command.`;
            }
            
        } catch (error) {
            if(error)timeout_send(message, "Error happened during user creation process.");
            console.log(error);
            pool.destroy();
        }   
        pool.destroy();
    },

    card: async function(message){
        /*check whether current user is logged in database
        if not, create a new user with id and username input, default privilege=0    
        */
        const pool = new Database();
        
        let ff14_character = "No character Linked";
        let cur_user = null;
        try {
            cur_user = await pool.user_info(message.author.id);
            if (cur_user.rowCount === 0){
                await pool.insert(message.author.id, message.author.username);
                timeout_send(message, "Thank you for using this bot!\nNew user added.");
                pool.destroy();
                pool= new Database();
                
                cur_user = await pool.user_info(message.author.id);
            }
            
            if (cur_user === null){throw "Error, current user still have not been added to database!";}
            if(cur_user.rows[0].ff14_loadstone !== undefined) 
                ff14_character = cur_user.rows[0].fname + " " + cur_user.rows[0].lname;
        } catch (error) {
            console.log(message, error);
            timeout_send(message, error);
        }
        pool.destroy();
        console.log(cur_user.rows[0])
        let embed_ff14 = undefined;
        let embed = new Discord.MessageEmbed()
								.setColor('#63d6ff')
								.setAuthor(message.author.tag,message.author.displayAvatarURL())
								.setTimestamp()
								.setTitle("Discord Card")
								.addFields({ name: 'Username', value: message.author.username },
								{ name: 'User ID', value: message.author.id, inline: true },
                                { name: 'FF14 Character', value: ff14_character, inline: true },);
                                
        if (cur_user === null){throw "Error, current user still have not been added to database!";}
        if(cur_user.rows[0].ff14_loadstone !== undefined){
            embed_ff14 = await embeded_ff14(message, true
                                            , ff14_character
                                            , cur_user.rows[0].server);
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
    
}