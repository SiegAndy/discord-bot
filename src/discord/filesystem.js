const {loadstone} = require("./loadstone.js");
const {fflogs} = require("./fflogs_analysis.js");
const {Database} = require('../database/database_postgre.js');
const{timeout_send, server_to_server_region, server_to_data_center} = require('../util/funcs');
// const{ff14, user} = require('../util/classes');

const Discord = require('discord.js');


// need to change: store ID of ff14 character into msgs.json or establish a database with table ff14_info and discord_info
async function embeded_ff14(message, flag=false, character_name="", server=""){
    let character_info = null;
    try {
        character_info = await loadstone.find_character(message,flag,-1,character_name,server);
    } catch (error) {
        timeout_send(message, error);
        console.log(error);
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

async function create_user(message){
    const pool = new Database();
    //~create [discord_id] [discord_username] [privilege] [lodestone]
    //~create 483897747137626116 SiegAndy 3 25526101    

    let content = message.content.split(' ').slice(1);
    let cur_user = null;
    try {
        if(content.length === 0){//~create
            await pool.insert(message.author.id, message.author.username);
            timeout_send(message, `Thank you for using this bot!\nNew user ${message.author.username} added.`);
        }
        else if(content.length > 1 && content.length < 5){
            //await warning_helper(content[0]);
            cur_user = await pool.user_info(message.author.id);
            let username;
            // if(content.length === 1){//~create [privilege]
            //     if(parseInt(cur_user.rows[0].privilege) < parseInt(content[0])){
            //         timeout_send(message, `You can't set privilege higher than you own.\nYour clearence level is: ${cur_user.rows[0].privilege}.`);    
            //         pool.destroy();
            //         return;
            //     }
            //     username = message.author.username;
            //     await pool.insert(message.author.id, message.author.username, parseInt(content[0]));
            // }
            if(content.length === 2){//~create [discord_id] [discord_username]
                username = content[1];
                await pool.insert(content[0], content[1]);
            }
            else if(content.length === 3){//~create [discord_id] [discord_username] [privilege]
                if(parseInt(cur_user.rows[0].privilege) >= parseInt(content[2])){
                    timeout_send(message, `You can't set privilege higher than you own.\nYour clearence level is: ${cur_user.rows[0].privilege}.`);
                    pool.destroy();
                    return;                    
                } 
                username = content[1];
                await pool.insert(content[0], content[1], parseInt(content[2]));
            }           
            else if(content.length === 4){//~create [discord_id] [discord_username] [privilege] [lodestone]
                //console.log(content)
                if(parseInt(cur_user.rows[0].privilege) >= parseInt(content[2])){
                    timeout_send(message, `You can't set privilege higher than you own.\nYour clearence level is: ${cur_user.rows[0].privilege}.`);
                    pool.destroy();
                    return;                    
                } 
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
    }   
    finally{pool.destroy();}
    
}

async function link_ff14(message){
    const pool = new Database(); 
    let output = [], character_info=null;
    function helper(discord_id, username=null){
        
        output.push(character_info.Name, username||discord_id);
        
        return pool.insert_ff14(discord_id, character_info.ID
            , character_info.Name.split(' ')[0], character_info.Name.split(' ')[1], character_info.Server
            , server_to_data_center(character_info.Server), server_to_server_region(character_info.Server))
               
        
    }
    
    let content = message.content.split(' ').slice(1);
    try {
        if (content.length > 0 && content.length < 4){//~link [lodestone id]
            if (content.length === 1){
                character_info = await loadstone.find_character(message,true, parseInt(content[0]));
                await helper(message.author.id, message.author.username);
            }
            else if(content.length === 2){//~link [discord id] [lodestone id]
                character_info = await loadstone.find_character(message,true, parseInt(content[1]));
                await helper(content[0]);
            }  
            else if(content.length === 3){//~link [character name](fname lname) [server]
                character_info = await loadstone.find_character(message,true,-1,content[0]+" "+content[1],content[2]);
                await helper(message.author.id, message.author.username);
            }   
            else if(content.length === 4){//~link [discord id] [character name](fname lname) [server]
                character_info = await loadstone.find_character(message,true,-1,content[1]+" "+content[2],content[3]);
                await helper(content[0]);
            }       
            timeout_send(message, `Thank you for using this bot!\nNew ff14 Character: ${output[0]} linked with discord user: ${output[1]}.`);
        }
        else{
            throw `More than 3 arguments accepted ${content}, invalid command.`;
        }
    } catch (error) {
        timeout_send(message, "Error happened during process of linking ff14 character with discord user.");
        console.log(error);
    }
    finally{pool.destroy();}
    

    
}

async function card(message){
    /*check whether current user is logged in database
    if not, create a new user with id and username input, default privilege=0    
    */
    const pool = new Database();
    
    let ff14_character = "No character Linked";
    let cur_user, discord_user = null;
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
        console.log(error);
        timeout_send(message, error);
    }
    pool.destroy();
    // console.log(cur_user.rows[0])
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
}

async function find_character(message){
    let result = await embeded_ff14(message);
    if(result === undefined) {return;}
    timeout_send(message, result);
}

/*current issue:
1): ~fflogs Ict Tease E9s => throw 'Result pulled from fflogs is undefined!!' while there is data returned
2): auto creating new user profile and auto linking current user with character might not be wanted.
*/
async function check_rank(message){
    let linked = true;
    let content = message.content.replace("~fflogs",'').split(' ').slice(1);
    let result = undefined;

    const pool = new Database();
    let cur_user = null;
    try {
        linked = false;
        cur_user = await pool.user_info(message.author.id);
        if (cur_user.rowCount === 0){
            await pool.insert(message.author.id, message.author.username); // auto creating new user profile
            timeout_send(message, "Thank you for using this bot!\nNew user added.");
            pool.destroy();
            pool = new Database();            
            cur_user = await pool.user_info(message.author.id);
            result = await fflogs.check_rank(message);
            if (cur_user === null){throw "Error, current user still have not been added to database!";}
        }   
        else{
            if(cur_user.rows[0].ff14_loadstone === undefined) linked = false; // no linked character
            else{ //cur_user.rows[0].ff14_loadstone !== undefined => we have character name, server, data center from database
                if(content.length === 2){//['',combatname] from content
                    result = await fflogs.check_rank_onlyCombatName(message
                        , cur_user.rows[0].region, cur_user.rows[0].server
                        , cur_user.rows[0].fname+" "+cur_user.rows[0].lname
                        , content[0]);
                }
                else{// normal execution
                    result = await fflogs.check_rank(message);
                }
            }
        }
        if (result === undefined || result[0] === undefined){throw "Result pulled from fflogs is undefined!!"}

        if(!linked){
            await pool.insert_ff14(cur_user.discord_id, cur_user.ff14_loadstone
                , cur_user.fname, cur_user.lname, cur_user.server
                , cur_user.datacenter, cur_user.region)            
            timeout_send(message, `Character: ${result[2]} linked with User: ${message.author.username} with ID: ${message.author.id}`);
        }
    } catch (error) {
        console.log(error);
        timeout_send(message, error);
    } 
    finally{pool.destroy();}    
}

async function check_rank_temp(message){
    let linked = true;
    let content = message.content.replace("~fflogs",'').split(' ').slice(1);
    let result = undefined;

    const pool = new Database();
    let cur_user = null;
    // console.log(content)
    try {
        if(content.length == 0){ // ~fflogs => needs a pre-linked ff14 character
            cur_user = await pool.user_info(message.author.id);
            if (cur_user.rowCount === 0){
                timeout_send('Current user is not in the database, please create a new user profile. (~create)')
            }
            else{
                if(cur_user.rows[0].ff14_loadstone === undefined){
                    timeout_send('Current user has no ff14 character linked in the database, please link a new ff14 character. (~link [lodestone id])\
                    \n https://na.finalfantasyxiv.com/lodestone/character/YOUR_lodestone_ID/')
                }
                else{
                    // console.log(cur_user);
                    message.content = `~fflogs ${cur_user.rows[0].fname+" "+cur_user.rows[0].lname} ${cur_user.rows[0].server} ${cur_user.rows[0].region}`
                    result = await fflogs.check_rank(message);
                }
            }
        }
        else{
            result = await fflogs.check_rank(message);
        }
    } catch (error) {
        console.log(error);
        timeout_send(message, error);
    }
    finally{pool.destroy();}    
}


module.exports = {
    create_user: create_user,

    link_ff14: link_ff14,

    card: card,

    check_rank: check_rank_temp ,

    find_character: find_character,     
}