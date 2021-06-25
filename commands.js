
const Discord = require('discord.js');
const files = require('./filesystem.js');
function timeout_send(message, content, deletetime = 60000){
    setTimeout(function(){message.channel.send(content).then(d_msg => {d_msg.delete({ timeout: deletetime });});}
    , 10);
}


module.exports = {
    help: function(message){
        message.delete({ timeout: 10000 }).then(msg => console.log(`Deleted 'Help' message from ${msg.author.username}`)).catch(console.error);

        let embed_help = new Discord.MessageEmbed()
								.setColor('#99d6ff')
								.setTimestamp()
								.addFields(
                                { name: "1): Use command '~Write [content]' to preset message."
                                , value:"2): Use command '~Get [username]' to read preset message." },
                                { name: "3): Use command '~fflogs character_firstName character_lastName [combatName] [server_name] ' to get highest rank fflogs."
                                , value:"		E.g. ~fflogs T'aldarim Annie E9s Sargatanas. combatName and server_name are omitable." },
                                { name: "4): Use command '~find character_firstName character_lastName [server_name] ' to get ff14 character card."
                                , value:"		E.g. ~find T'aldarim Annie Sargatanas. "  },
                                { name: "		server_name is omitable only if no character with duplicate name in other server."
                                , value: "5): Use command '~whoami' to shows discord user card.(if linked with ff14 character, ff14 character card would also show up.)" },
                                { name: "6): Use command '~relay' to relay audio from desktop."
                                , value: "   (This function is under construction, error expected.)" },
                                )
        timeout_send(message,embed_help);
        
		// message.channel.send("1): Use command '~Write [content]' to preset message.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
		// message.channel.send("2): Use command '~Get [username]' to read preset message.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
		// message.channel.send("3): Use command '~fflogs character_firstName character_lastName [combatName] [server_name] ' to get highest rank fflogs.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
		// message.channel.send("		E.g. ~fflogs T'aldarim Annie E5s Sargatanas. combatName and server_name are omitable.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
        // message.channel.send("4): Use command '~find character_firstName character_lastName [server_name] ' to get ff14 character card.").then(d_msg => {d_msg.delete({ timeout: 60000 });});
        // message.channel.send("		E.g. ~fflogs T'aldarim Annie Sargatanas. ").then(d_msg => {d_msg.delete({ timeout: 60000 });}); 
        // message.channel.send("		server_name is omitable only if there is no character with duplicate name in other server.").then(d_msg => {d_msg.delete({ timeout: 60000 });}); 
        // message.channel.send("5): Use command '~whoami' to shows discord user card.(if linked with ff14 character, ff14 character card would also show up.)").then(d_msg => {d_msg.delete({ timeout: 60000 });});
    },
    
    random: function(message){message.channel.send(Math.round(Math.random()*1000));},
    
    randomNumber: function(message,number){message.channel.send(Math.round(Math.random()*number));},

    card: function(message, client_msgs){files.card(message, client_msgs);},
    
    write: function(message, client_msgs){files.write_message(message, client_msgs);},

    get: function(message, client_msgs){files.get_message(message, client_msgs);},

    get_withName: function(message, client_msgs){files.get_message_name(message, client_msgs);},

    remove: function(message, client_msgs, index){files.remove_message(message, client_msgs, index);},

    check_rank: function(message, client_msgs){files.check_rank(message, client_msgs);},

    find_character: function(message){files.find_character(message);},

    auto_check_party_member: function(message){files.auto_check_party_member(message);},

    local_relay: function(message){files.local_relay(message);}
}