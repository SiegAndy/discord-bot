const{webhooks, server_list, zone_38, server_to_server_region, timeout_send, FluentFFlogs} = require('./Classes.js')
const axios = require('axios');

// to use this function, need to open act.

//https://www.fflogs.com/v1/parses/character/adfwsdg%20piper/adamantoise/NA?bracket=0&compare=0&timeframe=historical&api_key=60cf5fc24a60225a8d6e343ba3f31a21
//https://www.fflogs.com/v1/parses/character/T%27aldarim%20Annie/Sargatanas/NA?bracket=0&compare=0&timeframe=historical&api_key=60cf5fc24a60225a8d6e343ba3f31a21

function get_icon_url(job){
    let url = 'https://static.wikia.nocookie.net/ffxiv_gamepedia/images';
    switch(job){
        case 'Astrologian':
            url += '/3/32/Astrologian.png';
            return url;
        case 'Bard':
            url += '/8/82/Bard.png';
            return url;
        case 'Black Mage':
            url += '/4/4e/Black_Mage.png';
            return url;
        case 'Blue Mage':
            url += '/d/d5/Blue_Mage.png';
            return url;
        case 'Dancer':
            url += '/4/41/Dancer.png';
            return url;
        case 'Dark Knight':
            url += '/6/69/Dark_Knight.png';
            return url;
        case 'Dragoon':
            url += '/c/c7/Dragoon.png';
            return url;
        case 'Gunbreaker':
            url += '/3/31/Gunbreaker.png';
            return url;
        case 'Machinist':
            url += '/e/e0/Machinist.png';
            return url;
        case 'Monk':
            url += '/4/44/Monk.png';
            return url;
        case 'Ninja':
            url += '/2/21/Ninja.png';
            return url;
        case 'Paladin':
            url += '/b/b2/Paladin.png';
            return url;
        case 'Scholar':
            url += '/c/c5/Scholar.png';
            return url;
        case 'Summoner':
            url += '/2/2f/Summoner.png';
            return url;        
        case 'Warrior':
            url += '/9/97/Warrior.png';
            return url;
        case 'White Mage':
            url += '/e/e7/White_Mage.png';
            return url;
        case 'Red Mage':
            url += '/3/36/Red_Mage.png';
            return url;
        case 'Samurai':
            url += '/0/09/Samurai.png';
            return url;
        default:
            return 'https://cdn.discordapp.com/attachments/794068116439171083/861067688188969010/800px-Question_opening-closing.png'
    }
}

async function fetch_logs(message, name, server, encounterID=-1, partition=false, metric='dps', timeframe='historical', mode='parses'){
    // partition= None || 1; metric= dps || hps || bossdps || tankhps || playerspeed; timeframe= historical || today; mode= parses || rankings;
    let URL = `https://www.fflogs.com/v1/${mode}/character/${name}/${server}/${server_to_server_region(server)}?`;
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

    output_msgs += `${content[0]} ${content[1]} ${player_server}\n     Encounter       Highest Rank        Job\n`;
    
    for (encounter in encounters){
        // console.log(encounters[encounter].id)
        let responses = await fetch_logs(message, character_name, player_server
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