
const files = require('./filesystem.js');
const {help} = require('./Classes.js');
const {local_relay} = require('./relay.js');

module.exports = {

    // those function are deprecated due to filesystem changes:

    // write: function(message, client_msgs){files.write_message(message, client_msgs);},

    // get: function(message, client_msgs){files.get_message(message, client_msgs);},

    // get_withName: function(message, client_msgs){files.get_message_name(message, client_msgs);},

    // remove: function(message, client_msgs, index){files.remove_message(message, client_msgs, index);},


    help_cmd: function(message){help(message);},
    
    random: function(message){message.channel.send(Math.round(Math.random()*1000));},
    
    randomNumber: function(message,number){message.channel.send(Math.round(Math.random()*number));},

    create_user: function (message){files.create_user(message);},

    card: function(message, client_msgs){files.card(message);},
    
    check_rank: function(message, client_msgs){files.check_rank(message, client_msgs);},

    find_character: function(message){files.find_character(message);},

    auto_check_party_member: function(message){files.auto_check_party_member(message);},

    local_relay: function(message){local_relay(message);},

    test: function(message){
        console.log(message.author);
    }
}