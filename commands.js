const files = require('./filesystem.js');
const {help} = require('./Classes.js');
// const {local_relay} = require('./relay.js');
const {act_auto} = require('./act_auto_fflogs.js')
const {reserve} = require('./library.js')

module.exports = {

    // those function are deprecated due to filesystem changes:

    // write: function(message, client_msgs){files.write_message(message, client_msgs);},

    // get: function(message, client_msgs){files.get_message(message, client_msgs);},

    // get_withName: function(message, client_msgs){files.get_message_name(message, client_msgs);},

    // remove: function(message, client_msgs, index){files.remove_message(message, client_msgs, index);},


    help_cmd: (message) => help(message),
    
    random: (message) => message.channel.send(Math.round(Math.random()*1000)),
    
    randomNumber: (message,number) => message.channel.send(Math.round(Math.random()*number)),

    create_user:  (message) => files.create_user(message),

    link_ff14:  (message) => files.link_ff14(message),

    card: (message) => files.card(message),
    
    check_rank: (message) => files.check_rank(message),

    find_character: (message) => files.find_character(message),

    act_auto: (message) => act_auto(message),

    // local_relay: ()=> console.log("under construction"),

    test: (message) => console.log(message.author),

    book: (message) => reserve(message),
}