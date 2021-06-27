require('dotenv').config({path: "C:/Users/zc470/Desktop/Extra/Discord-bot/.env"});
const Discord = require('discord.js');
const client = new Discord.Client();
client.msgs = require("./msgs.json");
const cmds = require('./commands.js');
const WC = require('./web_crawler.js');
const prefix = "~";

function timeout_send(message, content, deletetime = 60000){
    setTimeout(function(){message.channel.send(content).then(d_msg => {d_msg.delete({ timeout: deletetime });});}
    , 10);// 1000 = 1s;
}

client.on('ready', () => {
	console.log('Ready!');
	client.user.setPresence({
        status: "online",  // You can show online, idle... Do not disturb is dnd
        activity: {
            name: "~help to get instruction.",  
            type: "Using" 
        }
    });
});

client.on('message', message => {

	if (message.content.startsWith(prefix)){
		var cmdmsg = message.content.replace(prefix,'').split(' ');
		switch(cmdmsg[0].toLowerCase()){
			case "help": 
				cmds.help(message);
				break;
			case "random": 				
				if(cmdmsg.length === 1){cmds.random(message);}
				else if(cmdmsg.length === 2){cmds.randomNumber(message, cmdmsg[1]);}
				else{cmds.help(message);}
				break;
			case "whoami":
				cmds.card(message, client.msgs);
				break;
			case "write": 
				cmds.write(message, client.msgs);
				break;
			case "get": 
				if(cmdmsg.length === 1){cmds.get(message, client.msgs);}
				else if(cmdmsg.length === 2){cmds.get_withName(message, client.msgs);}
				else{cmds.help(message);}
				break;
			case "remove":
				if(cmdmsg.length !== 2){
					timeout_send(message, "Illegal format. `~remove [index]` ")
					cmds.help(message);
					break;
				}
				cmds.remove(message, client.msgs, cmdmsg[1]);// need index of remove message
				break;
			case "fflogs":
				cmds.check_rank(message, client.msgs);
				break;
			case "find":
				cmds.find_character(message);
				break;
			case "load":
				timeout_send(message, "You are not supposed to use this command!")
				WC.loadstone_character_pic(2138764);
				break;
			case "auto":
				cmds.auto_check_party_member(message);
				break;
			case "relay":
				cmds.local_relay(message);
				break;
			case "m":
				timeout_send(message, `!market Aether ${message.content.slice(3)}`)
				break;
			default:
				//message.channel.send("Unkonwn comamnd line.");
				timeout_send(message, "Unkonwn comamnd line.")
				cmds.help(message);
				break;
		}
	}
});

client.login(process.env.DISCORD_TEST_APP_API_KEY);