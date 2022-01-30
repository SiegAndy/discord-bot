
const {timeout_send, help} = require('../util/funcs');
const {prefix, DISCORD_TEST_APP_API_KEY} = require('../util/variables');

const {create_user, link_ff14, card, check_rank, find_character} = require('./filesystem');
const {loadstone_character_pic} = require('./web_crawler');
const {act_auto} = require('./act_auto_fflogs')
const {reserve} = require('./library')
// const {local_relay} = require('./relay.js');

const {Client, Intents} = require('discord.js');


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
//client.msgs = require("./msgs.json"); using json for data storage, replacing by PostgreSQL


client.on('ready', () => {
	console.log('Ready!');
	client.user.setPresence({
        status: "online",  // You can show online, idle... Do not disturb is dnd
        activity: {
            name: "~help to get instruction.",  
            type: "PLAYING" 
        }
    });
});

client.on('message', message => {
	//if(message.author.bot){return;}
	// console.log(message.channel)
	if (message.content.startsWith(prefix)){
		//timeout_send(message, "WARNING!!\nDue to the change of storage and filesystem functions, most of functions are deprecated!\nPlease be aware correct function may result unexpected result!!", 60000);
		var cmdmsg = message.content.replace(prefix,'').split(' ');
		// user_message_delete(message);
		if(message.author.bot){
			switch(cmdmsg[0].toLowerCase()){
				case 'auto':
					act_auto(message);
					break;
				default:
				//message.channel.send("Unkonwn comamnd line.");
				timeout_send(message, "Unkonwn comamnd line.")
				help(message);
				break;
			}
		}
		else{
			switch(cmdmsg[0].toLowerCase()){
				case "help": 
					help(message);
					break;
				case "random": 				
					if(cmdmsg.length === 1){
						message.channel.send(Math.round(Math.random()*1000));
					}
					else if(cmdmsg.length === 2){
						message.channel.send(Math.round(Math.random()*number));
					}
					else{
						help(message);
					}
					break;
				case "create":
					create_user(message);
					break;
				case "link":
					link_ff14(message);
					break;
				case "whoami":
					card(message);
					break;			
				case "fflogs":
					check_rank(message);
					break; 
				case "find":
					find_character(message);
					break;
				case "load":
					timeout_send(message, "You are not supposed to use this command!")
					loadstone_character_pic(2138764);
					break;
				case "auto":// supposed to check discord user's ff14 info if linked 
					act_auto(message);
					break;
				// case "relay": // under construction
				// 	// local_relay(message);
				// 	break;
				case "m":
					timeout_send(message, `!market Aether ${message.content.slice(3)}`)
					break;
				case "test":
					console.log(message.author);
					break;
				case "book":
					reserve(message);
					break;
				// case "write": 
				// 	write(message, client.msgs);
				// 	break;
				// case "get": 
				// 	if(cmdmsg.length === 1){get(message, client.msgs);}
				// 	else if(cmdmsg.length === 2){get_withName(message, client.msgs);}
				// 	else{help(message);}
				// 	break;
				// case "remove":
				// 	if(cmdmsg.length !== 2){
				// 		timeout_send(message, "Illegal format. `~remove [index]` ")
				// 		help(message);
				// 		break;
				// 	}
				// 	remove(message, client.msgs, cmdmsg[1]);// need index of remove message
				// 	break;
	
				default:
					//message.channel.send("Unkonwn comamnd line.");
					timeout_send(message, "Unkonwn comamnd line.")
					help(message);
					break;
			}
		}		
	}
});

client.login(DISCORD_TEST_APP_API_KEY);

const hello = 'hello'
exports.hello = hello;