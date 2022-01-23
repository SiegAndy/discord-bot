require('dotenv').config(__dirname + '/.env');
const{webhooks, server_list, server_to_server_region, timeout_send, FluentFFlogs, zone_43, zone_44, zone_30, zone_32} = require('./Classes.js')
const axios = require('axios');
const { response } = require('express');

// to use this function, need to open act.

//https://www.fflogs.com/v1/parses/character/adfwsdg%20piper/adamantoise/NA?bracket=0&compare=0&timeframe=historical&api_key=60cf5fc24a60225a8d6e343ba3f31a21
//https://www.fflogs.com/v1/parses/character/T%27aldarim%20Annie/Sargatanas/NA?bracket=0&compare=0&timeframe=historical&api_key=60cf5fc24a60225a8d6e343ba3f31a21

// return fflogs json files
async function fetch_logs(name, server, zone=-1, encounterID=-1, partition=false, metric='dps', timeframe='historical', mode='parses'){
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
        console.log(URL);
        return await axios.get(URL);    
    } catch (error) {
        // timeout_send(message, 'Error happened when fetching data from fflogs, please check inputs!')
        console.log('Error happened when ~auto fetching data from fflogs, please check inputs!')
        // console.log(error);
    }
}


// no return 
async function act_auto(args){
    console.log(args);
    let combatZone = [false,false];
    if(args['combatZone'] == 'current raid tier'){
        combatZone[0] = true;
    }
    if(args['combatZone'] == 'ultimates'){
        combatZone[1] = true;
    }
    if(args['combatZone'] == 'both'){
        combatZone[0] = true;
        combatZone[1] = true;
    }
    
    let echo = false
    if(args['echo'] == 'yes'){
        echo = true;
    }
    let metric = args['metric'];
    let timeframe = args['timeframe'];
    let webhook = args['webhook']
    let character = args['character'].split(' ')
    let lname_server = character[1]; //AnnieSargatanas
    player_server = undefined
    for (server in server_list){
        if(lname_server.includes(server_list[server])){
            player_server = server_list[server];
            character[1] = character[1].slice(0, lname_server.length - player_server.length)
        }    
    }
    // if(player_server == undefined){throw 'Player server is not in database.'}
    // TODO: check player server/datacenter field in the pass-in json
    if(player_server == undefined){player_server = "Sargatanas"}

    character_name = character[0]+'%20'+character[1];

    let output_msgs = "```ml\n";
    let encounters, responses;

    if (combatZone[0]){
        encounters = zone_44.encounters;

        output_msgs += `${character[0]} ${character[1]} ${player_server}\n\n     Encounter       Highest Rank        Job\n`;
        
        responses = null;
        for (encounter in encounters){
            responses = await fetch_logs(character_name, player_server, zone_44.id
            , encounters[encounter].id, false, metric, timeframe, mode='parses');
            responses = responses.data
            
            if(echo){
                let with_echo = await fetch_logs(character_name, player_server, zone_44.id
                    , encounters[encounter].id, 13, metric, timeframe, mode='parses');
                with_echo = with_echo.data
                for(elem in with_echo){
                    responses.push(with_echo[elem]);
                }
                console.log(responses)
            }            
            
            responses = new FluentFFlogs(responses).difficulty(101).highest_percentile()
            if(responses.difficulty === 101){
                output_msgs += `${encounters[encounter].name}        ${Math.floor(responses.percentile)}            ${responses.spec}\n`;
            }else{
                output_msgs += `${encounters[encounter].name}       No savage combat data found\n`;
            }
        }
        
    }
    
    if (combatZone[1]){
        output_msgs += `\n\n         Ultimates               Cleared    Rank    Logs\n`
        let ultimates_45 = zone_30.encounters;
        for (ult in ultimates_45){
            responses = await fetch_logs(character_name, player_server, zone_30.id
                , ultimates_45[ult].id, partition=false, metric, timeframe, mode='parses');
            let nums = responses.data.length
            responses = new FluentFFlogs(responses.data).highest_percentile()
            if(nums !== 0){
                output_msgs += `${ultimates_45[ult].name}       Yes       ${Math.floor(responses.percentile)}      ${nums}\n`; 
            }else{
                output_msgs += `${ultimates_45[ult].name}        No        0      0\n`;       
            }
        }

        responses = await fetch_logs(character_name, player_server, zone_32.id
            , zone_32.encounters[0].id, partition=false, metric='dps', timeframe='historical', mode='parses');
        let nums = responses.data.length
        responses = new FluentFFlogs(responses.data).highest_percentile()
        if(nums !== 0){
            output_msgs += `${zone_32.encounters[0].name}       Yes       ${Math.floor(responses.percentile)}      ${nums}\n`; 
        }else{
            output_msgs += `${zone_32.encounters[0].name}        No        0      0\n`;       
        }
    }
    
    output_msgs += "```";
    axios.post(webhook,{content : output_msgs});
    for (hook in webhooks){
        // console.log(webhooks[hook])
        axios.post(webhooks[hook],{content : output_msgs});
    }  
}
//https://www.fflogs.com/v1/parses/character/T'aldarim%20Annie/Sargatanas/NA?encounter=73&metric=dps&partition=1&timeframe=historical&api_key=60cf5fc24a60225a8d6e343ba3f31a21
//https://www.fflogs.com/v1/parses/character/T'aldarim%20Annie/Sargatanas/NA?encounter=77&metric=dps&partition=1&timeframe=historical&api_key=60cf5fc24a60225a8d6e343ba3f31a21

exports.act_auto = act_auto;

// need integration from act_auto_fflogs with fflogs_analysis   