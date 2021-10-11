const{webhooks, server_list, zone_38, server_to_server_region, timeout_send, FluentFFlogs, zone_30, zone_32} = require('./Classes.js')
const axios = require('axios');

// to use this function, need to open act.

//https://www.fflogs.com/v1/parses/character/adfwsdg%20piper/adamantoise/NA?bracket=0&compare=0&timeframe=historical&api_key=60cf5fc24a60225a8d6e343ba3f31a21
//https://www.fflogs.com/v1/parses/character/T%27aldarim%20Annie/Sargatanas/NA?bracket=0&compare=0&timeframe=historical&api_key=60cf5fc24a60225a8d6e343ba3f31a21

// return fflogs json files
async function fetch_logs(message, name, server, zone=-1, encounterID=-1, partition=false, metric='dps', timeframe='historical', mode='parses'){
    // partition= None || 1; metric= dps || hps || bossdps || tankhps || playerspeed; timeframe= historical || today; mode= parses || rankings;
    let URL = `https://www.fflogs.com/v1/${mode}/character/${name}/${server}/${server_to_server_region(server)}?`;
    if(zone != -1){
        URL += `zone=${zone}&`
    }
    if(encounterID !== -1){
        URL += `encounter=${encounterID}&`
    }
    URL += `metric=${metric}&`;
    if(partition){
        URL += `partition=${partition}`;
    }
    URL += `&timeframe=${timeframe}&api_key=${process.env.FFLOGS_API_KEY}`;
    try {
        //console.log(URL);
        return await axios.get(URL);    
    } catch (error) {
        timeout_send(message, 'Error happened when fetching data from fflogs, please check inputs!')
        console.log(error);
    }
}

// no return 
async function act_auto(message){    
    // let ff14_embed = new Discord.MessageEmbed().setTimestamp();
    let output_msgs = "```ml\n";
    let content = message.content.split(' ').slice(1);
    content.splice(content.length-2);
    let lname_server = content[content.length-1]; //AnnieSargatanas
    let player_server = 'Sargatanas';
    for (server in server_list){
        if(lname_server.includes(server_list[server])){
            player_server = server_list[server];
            content[1] = content[1].slice(0, lname_server.length - player_server.length)
        }    
    }
    character_name = content[0]+'%20'+content[1];

    // let character_info = await find_character(message, true, lodestone=-1, character_name, player_server);
    // ff14_embed.setAuthor(`${character_name} ${player_server}`, character_info.Avatar);
    let encounters = zone_38.encounters;

    output_msgs += `${content[0]} ${content[1]} ${player_server}\n\n     Encounter       Highest Rank        Job\n`;
    
    let responses = null;
    for (encounter in encounters){
        // console.log(encounters[encounter].id)
        responses = await fetch_logs(message, character_name, player_server, zone_38.id
        , encounters[encounter].id, partition=1, metric='dps', timeframe='historical', mode='parses');
        responses = new FluentFFlogs(responses.data).difficulty(101).highest_percentile()
        if(responses.difficulty === 101){
            output_msgs += `${encounters[encounter].name}        ${Math.floor(responses.percentile)}             ${responses.spec}\n`;
            // ff14_embed.addField({ name: encounters[encounter].name, value: Math.floor(responses.percentile), inline: false });
            // ff14_embed.setThumbnail(get_icon_url(responses.spec));         
        }else{
            output_msgs += `${encounters[encounter].name}       No savage combat data found\n`;
            // ff14_embed.addField({ name: encounters[encounter].name, value: 'No savage combat data', inline: false })            
        }
    }
    output_msgs += `\n\n         Ultimates               Cleared    Rank    Logs\n`

    let ultimates_4 = zone_30.encounters;
    for (ult in ultimates_4){
        responses = await fetch_logs(message, character_name, player_server, zone_30.id
            , ultimates_4[ult].id, partition=false, metric='dps', timeframe='historical', mode='parses');
        let nums = responses.data.length
        responses = new FluentFFlogs(responses.data).highest_percentile()
        if(nums !== 0){
            output_msgs += `${ultimates_4[ult].name}       Yes       ${Math.floor(responses.percentile)}      ${nums}\n`; 
        }else{
            output_msgs += `${ultimates_4[ult].name}        No        0      0\n`;       
        }
    }
    responses = await fetch_logs(message, character_name, player_server, zone_32.id
        , zone_32.encounters[0].id, partition=false, metric='dps', timeframe='historical', mode='parses');
    let nums = responses.data.length
    responses = new FluentFFlogs(responses.data).highest_percentile()
    if(nums !== 0){
        output_msgs += `${zone_32.encounters[0].name}       Yes       ${Math.floor(responses.percentile)}      ${nums}\n`; 
    }else{
        output_msgs += `${zone_32.encounters[0].name}        No        0      0\n`;       
    }

    output_msgs += "```";
    //timeout_send(message,output_msgs);
    for (hook in webhooks){
        console.log(webhooks[hook])
        axios.post(webhooks[hook],{content : output_msgs});
    }   
    
}
//https://www.fflogs.com/v1/parses/character/T'aldarim%20Annie/Sargatanas/NA?encounter=73&metric=dps&partition=1&timeframe=historical&api_key=60cf5fc24a60225a8d6e343ba3f31a21
//https://www.fflogs.com/v1/parses/character/T'aldarim%20Annie/Sargatanas/NA?encounter=77&metric=dps&partition=1&timeframe=historical&api_key=60cf5fc24a60225a8d6e343ba3f31a21

exports.act_auto = act_auto;


// need integration from act_auto_fflogs with fflogs_analysis