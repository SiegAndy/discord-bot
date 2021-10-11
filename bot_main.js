require('dotenv').config({path: "C:/Users/zc470/Desktop/Extra/Discord-bot/.env"});
const {timeout_send, user_message_delete, help} = require('./Classes.js');
const Discord = require('discord.js');
const cmds = require('./commands.js');
const WC = require('./web_crawler.js');

const client = new Discord.Client();
//client.msgs = require("./msgs.json"); using json for data storage, replacing by PostgreSQL
const prefix = "!";

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
		user_message_delete(message);
		if(message.author.bot){
			switch(cmdmsg[0].toLowerCase()){
				case 'auto':
					cmds.act_auto(message);
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
					cmds.help_cmd(message);
					break;
				case "random": 				
					if(cmdmsg.length === 1){cmds.random(message);}
					else if(cmdmsg.length === 2){cmds.randomNumber(message, cmdmsg[1]);}
					else{help(message);}
					break;
				case "create":
					cmds.create_user(message);
					break;
				case "link":
					cmds.link_ff14(message);
					break;
				case "whoami":
					cmds.card(message);
					break;			
				case "fflogs":
					cmds.check_rank(message);
					break; 
				case "find":
					cmds.find_character(message);
					break;
				case "load":
					timeout_send(message, "You are not supposed to use this command!")
					WC.loadstone_character_pic(2138764);
					break;
				case "auto":// supposed to check discord user's ff14 info if linked 
					cmds.act_auto(message);
					// cmds.auto_check_party_member(message);
					break;
				// case "relay": // under construction
				// 	// cmds.local_relay(message);
				// 	break;
				case "m":
					timeout_send(message, `!market Aether ${message.content.slice(3)}`)
					break;
				case "test":
					cmds.test(message);
					break;
	
				// case "write": 
				// 	cmds.write(message, client.msgs);
				// 	break;
				// case "get": 
				// 	if(cmdmsg.length === 1){cmds.get(message, client.msgs);}
				// 	else if(cmdmsg.length === 2){cmds.get_withName(message, client.msgs);}
				// 	else{cmds.help(message);}
				// 	break;
				// case "remove":
				// 	if(cmdmsg.length !== 2){
				// 		timeout_send(message, "Illegal format. `~remove [index]` ")
				// 		cmds.help(message);
				// 		break;
				// 	}
				// 	cmds.remove(message, client.msgs, cmdmsg[1]);// need index of remove message
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

client.login(process.env.DISCORD_TEST_APP_API_KEY);