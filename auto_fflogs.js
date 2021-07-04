const fs = require('fs')
const fs_promises = require('fs').promises;
const{server_list, server_to_server_region, server_to_data_center} = require('./Classes.js')
//const msgs = require('../Discord-bot/msgs.json')
const party_member = require("./Data/party_member.json");
var folderPath = '../../../../../Users/zc470/AppData/Roaming/Advanced Combat Tracker/FFXIVLogs'

const { promisify } = require('util');
const sleep = promisify(setTimeout);

function findIndex_elem(input_array, input_elem){return input_array.findIndex((elem)=> elem === input_elem)}
function findIndex_str_array(input_array,target_str){
    let result = undefined;
    input_array.forEach((elem)=>{
        let index = elem.search(target_str);
        if(index !== -1){
            result = {element: elem, index: index};
        }
    });
    return result;
}

function parse_helper(player_info, intended_player_name){// return duplicate player's length (>0 means skip current target)
    let duplicate_player = [];
    for(let i = 0; i < player_info.length; ++i){ 
        if(player_info[i].name.localeCompare(intended_player_name) === 0){
            duplicate_player.push(intended_player_name)
        }
    }                    
    return duplicate_player.length;
}

function time_adjustment(current_time,time_intervel){
    //time_intervel = [yr,mon,day,hr,min]
    //current_time = [ 2020, '01', 01, 00, '03', 43 ]
    return  yr_adjustment(
                mon_adjustment(
                    day_adjustment(
                        hr_adjustment(
                            min_adjustment(current_time,time_intervel[4]),time_intervel[3]),time_intervel[2]),time_intervel[1]),time_intervel[0]);

    function min_adjustment(current_time, time){
        if((parseInt(current_time[4]) - time) < 0){//less than 5 min
            current_time[4] = parseInt(current_time[4]) + 60 - time;
            if((parseInt(current_time[3]) - 1) < 0){//less than 1 hr
                current_time[3] = parseInt(current_time[3]) + 23;
                if((parseInt(current_time[2]) - 1) < 1){//less than 1 day
                    current_time[2] = parseInt(current_time[2]) + 29;
                    if((parseInt(current_time[1]) - 1) < 1){//less than 1 mon
                        current_time[1] = parseInt(current_time[1]) + 11;
                        current_time[0] = current_time[0] - 1;
                    }
                    else{current_time[1] = parseInt(current_time[1]) - 1;}
                }
                else{current_time[2] = parseInt(current_time[2]) - 1;}
            }
            else{current_time[3] = parseInt(current_time[3]) - 1;}
        }
        else{current_time[4] = parseInt(current_time[4]) - time;}
        return current_time;
    }

    function hr_adjustment(current_time, time){
        if((parseInt(current_time[3]) - time) < 0){//less than 1 hr
            current_time[3] = parseInt(current_time[3]) + 24 - time;
            if((parseInt(current_time[2]) - 1) < 1){//less than 1 day
                current_time[2] = parseInt(current_time[2]) + 29;
                if((parseInt(current_time[1]) - 1) < 1){//less than 1 mon
                    current_time[1] = parseInt(current_time[1]) + 11;
                    current_time[0] = current_time[0] - 1;
                }
                else{current_time[1] = parseInt(current_time[1]) - 1;}
            }
            else{current_time[2] = parseInt(current_time[2]) - 1;}
        }
        else{current_time[3] = parseInt(current_time[3]) - time;}
        return current_time;
    }

    function day_adjustment(current_time, time){
        if((parseInt(current_time[2]) - time) < 1){//less than 1 day
            current_time[2] = parseInt(current_time[2]) + 30 - time;
            if((parseInt(current_time[1]) - 1) < 1){//less than 1 mon
                current_time[1] = parseInt(current_time[1]) + 11;
                current_time[0] = current_time[0] - 1;
            }
            else{current_time[1] = parseInt(current_time[1]) - 1;}
        }
        else{current_time[2] = parseInt(current_time[2]) - time;}
        return current_time;
    }

    function mon_adjustment(current_time, time){
        if((parseInt(current_time[1]) - time) < 1){//less than 1 mon
            current_time[1] = parseInt(current_time[1]) + 12 - time;
            current_time[0] = current_time[0] - 1;
        }
        else{current_time[1] = parseInt(current_time[1]) - time;}
        return current_time;
    }

    function yr_adjustment(current_time, time){current_time[0] = current_time[0] - time; return current_time;}
    
    
}

async function parse_player_info_from_message(player_message){// return player_info which is a []

    
    let player_info = [];// [{name:, server:, data_center:, server_region:}]
    for (pm in player_message){
        let frag = player_message[pm].split(' ')
        if(frag.length <= 1){continue;}
        
        if(findIndex_elem(frag, 'join') === -1 && findIndex_elem(frag, 'joins') === -1){continue;}
        if(findIndex_elem(frag, 'joined') !== -1){continue;}
        if(findIndex_elem(frag, 'disbanded') !== -1){continue;}
        if(findIndex_elem(frag, 'auracite ') !== -1){continue;}
        if(findIndex_elem(frag, 'travel') !== -1){continue;}
        if(findIndex_elem(frag, 'cross-world') !== -1){continue;} 
        if(findIndex_elem(frag, 'dissolve') !== -1){continue;}
        if(findIndex_elem(frag, 'sanctuary.') !== -1){continue;}
        if(findIndex_elem(frag, "Hades's") !== -1){continue;} // conflict between Hades server and fight: The Minstrel's Ballad: Hades's Elegy; need to figure out later

        let server_index_in_str = undefined;
        let server_name = undefined;
        if(findIndex_elem(frag, 'You') === 0){// "You join Nova ShimizuCactuar's party for Eden's Verse: Refulgence (Savage)."
        let server_names = [];
        let server_index_in_strs = [];
        for (server in server_list){
            let inner_server_index_in_str = findIndex_str_array(frag, server_list[server]); //  { element: 'LeonhartCactuar', index: 8 } 
            if(inner_server_index_in_str !== undefined){server_names.push(server_list[server]); server_index_in_strs.push(inner_server_index_in_str);}
            if(server_index_in_strs.length >= 1){
                server_name = server_names[0];
                server_index_in_str = server_index_in_strs[0];
                for(let i = 0; i < server_index_in_str.length; ++i){
                    if(server_index_in_strs[i].index >= server_index_in_str.index){
                        server_index_in_str = server_index_in_strs[i];
                        server_name = server_name[i];
                    }
                }
            }                
        }
            
            //if no server name match in fragments =>local server

            if(server_index_in_str !== undefined){
                let intended_player_name = `${frag[2]} ${server_index_in_str.element.substring(0,server_index_in_str.index)}`;
                
                if(player_info.length === 0 || parse_helper(player_info, intended_player_name) === 0){
                    player_info.push({name: intended_player_name, server: server_name
                        , data_center:server_to_data_center(server_name)
                        , server_region:server_to_server_region(server_name)})
                }
            }
            else{// no server name in string => player in the same server, at this time = Sargatanas
                let intended_player_name = `${frag[2]} ${frag[3].split("'")[0]}`;
                if(player_info.length === 0 || parse_helper(player_info, intended_player_name) === 0){
                    player_info.push({name: intended_player_name
                                    , server: "Sargatanas"
                                    , data_center: "Aether"
                                    , server_region: "NA"})
                }
            }
        }
        
        if(findIndex_elem(frag, 'joins') !== -1){// valid echo detected e.g. Kammux LeonhartCactuar joins the party.
            let server_names = [];
            let server_index_in_strs = [];
            for (server in server_list){
                let inner_server_index_in_str = findIndex_str_array(frag, server_list[server]); //  { element: 'LeonhartCactuar', index: 8 } 
                if(inner_server_index_in_str !== undefined){server_names.push(server_list[server]); server_index_in_strs.push(inner_server_index_in_str);}
                if(server_index_in_strs.length >= 1){
                    server_name = server_names[0];
                    server_index_in_str = server_index_in_strs[0];
                    for(let i = 0; i < server_index_in_str.length; ++i){
                        if(server_index_in_strs[i].index >= server_index_in_str.index){
                            server_index_in_str = server_index_in_strs[i];
                            server_name = server_name[i];
                        }
                    }
                }                
            }

            if(server_index_in_str !== undefined){
                let intended_player_name = `${frag[0]} ${server_index_in_str.element.substring(0,server_index_in_str.index)}`;
                if(player_info.length === 0 || parse_helper(player_info, intended_player_name) === 0){
                    player_info.push({name: intended_player_name, server: server_name
                                    , data_center:server_to_data_center(server_name)
                                    , server_region:server_to_server_region(server_name)})
                }                
            }
            else{
                let intended_player_name = `${frag[0]} ${frag[1]}`;
                if(player_info.length === 0 || parse_helper(player_info, intended_player_name) === 0){
                    player_info.push({name: `${frag[0]} ${frag[1]}`
                                    , server: "Sargatanas"
                                    , data_center: "Aether"
                                    , server_region: "NA"})
                }                
            }
        }
    }
    if(player_info.length > 8){
        player_info = player_info.slice(player_info.length - 8)
    }
    return player_info;
}

function get_time(){
    var active_time = new Date();
    active_time = [active_time.getFullYear(), active_time.getMonth()+1, active_time.getDate()
                , active_time.getHours(),active_time.getMinutes(), active_time.getSeconds()]
    return active_time.map((elem)=>{
        if(elem < 10){return '0' + elem.toString();}
        return elem;
    });
}


function output_json(content){
    fs.writeFile ("./Data/party_member.json", JSON.stringify (content, null, 4), err =>{if(err) throw err;});
}

async function logs_read_file(time){//no return; write inner function's return to json file
    var filePath = find_filePath(time);
    //let player_info = {content: undefined};
    let data = undefined;
    try {
        data = await fs_promises.readFile(filePath, 'utf8');
    } catch (err) {
        output_json({content: "No combat log found, please check if ACT is working!"});
        return console.log(err);
    }

    if(data === undefined){output_json({content: "Error when receiving data body."});return;}

        //|2239| = people join in; |0039| = you join or recruitment ended; 

        let messages = data.split('|');
        
        let time_message = ""; //"2020-06-23T14:33:10.0000000-04:00"; valid |0039| time 
        let player_message = [];
        let valid_entry = false;// player is indeed joined a new party.
        for (let i = 0; i < messages.length; ++i){
            if(messages[i].localeCompare('0039') === 0 || messages[i].localeCompare('0038') === 0){ // I join a group
                
                time_message = messages[i-1];// get current message's time
                //checking is this a valid group (not the one joined before) need to be the group just join. would set time intervel as 5 minuts
                let current_time = get_time();
                let time_intervel = [0,1,0,0,10]; //[yr,mon,day,hr,min]
                //current_time = [ 2020, '01', 01, 00, '03', 43 ]
                //in ACT log format `2020-06-23T14:33:06.0000000-04:00`
                current_time = time_adjustment(current_time, time_intervel);

                current_time = current_time.map((elem)=>{
                    if(parseInt(elem) < 10){return '0' + parseInt(elem).toString();}
                    return elem;
                });

                current_time = `${current_time[0]}-${current_time[1]}-${current_time[2]}T${current_time[3]}:${current_time[4]}:${current_time[5]}.0000000-04:00` 


                if(time_message.localeCompare(current_time) >= 0 ){// if within time range

                    player_message.push(messages[i+2]);
                    valid_entry = true;
                    
                }
                time_message = "";
            }

            if(valid_entry){// player is indeed joined a new party.
                if(messages[i].localeCompare('2239') === 0
                || messages[i].localeCompare('1039') === 0
                || messages[i].localeCompare('0039') === 0){
                    player_message.push(messages[i+2]);
                }
            }
            
        }
        let player_info = {content: undefined};
        player_info.content = await parse_player_info_from_message(player_message);
        let contents = party_member;
        if(player_info !== undefined && player_info.content.length !== 0){contents = {content: player_info.content};}
        //console.log(player_info)
        output_json(contents);
    
    
    return player_info;
    //return player_info;
}

async function find_filePath(time){// no return; time is an array with [year,month,date]
    var active_time = undefined;
    if(time === undefined){
        active_time = get_time();
    }
    else{
        active_time = time;
    }
    
    let filePath = folderPath + `/Network_20608_${active_time[0]}${active_time[1]}${active_time[2]}.log`;
    //let filePath = `./Network_20608_20210627.log`;
    
    
    return await filePath;
}

module.exports = {
    auto_find_party_member:async function(time){
        return await logs_read_file(time);
    },
}