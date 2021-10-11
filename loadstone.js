require('dotenv').config({path: "C:/Users/zc470/Desktop/Extra/Discord-bot/.env"});
const {server_list,timeout_send,help, data_centers, server_regions, dc_server, region_dc} = require('./Classes.js');
const axios = require('axios');


let loadstone_private_key = `&private_key=${process.env.LOADSTONE_PRIVATE_KEY}`;
function add_private_key(URL) {return URL + loadstone_private_key;};


//Could be improved by using fluent desgin for returned XIVAPI charactername request
async function find_character(message, flag=false, lodestone=-1, character_name='', server='', datacenter='', server_region=''){
    // Language, {Lang: }, data now is ignored, since XIVAPI set all of them to NULL when accessing player data.
    // with flag means input is inner function call from current/other file, without flag means input is ~find command.
    // if no lodestone id, then go for character name and server
    async function process(message, responses, character_name){
        let data = responses.data;
        //console.log(responses)
        if(data.Pagination.ResultsTotal === 1){
            let ID = data.Results[0].ID;
            // Lang = data.Results[0].Lang;
            return await get(message, add_private_key(default_URL + ID));
        }
        else{// multiple characters value in responses, check whether their name fit exactly the same as the target name
            for(result in data.Results){
                //console.log(`result.Name: ${data.Results[result].Name}, character_name: ${character_name}`);
                if(data.Results[result].Name.localeCompare(character_name) === 0 ){
                    let ID = data.Results[result].ID;
                    // Lang = data.Results[result].Lang;
                    return await get(message, add_private_key(default_URL + ID));
                }
            }
        }

        // console.log(`No valid character found with name ${character_name} in server ${server_name}`);
        return;
    }

    /*
    two types of get requests to XIVAPI:
    1): with character_name and optional server_name to get lodestone ID of that character
    2): with only URL to get lodestone infomation, private key and lodestone ID has been added to URL before function called.
    */
    async function get(message, URL, character_name=""){
        try{
            let responses = await axios.get(URL);
            console.log(URL)
            if(character_name !== ""){//type 1, then processing responses with other function
                return await process(message, responses, character_name);
            }
            else{//type 2, called by other function to return character infomation
                let returned = responses.data.Character;
                // if(flag){// Lang field check is ignoring since XIVAPI setting NULL to all characters
                //     await get(message, add_private_key(default_URL + search_by_name + responses.data.Character.Name + `&server=${responses.data.Character.Server}`)
                //                 , responses.data.Character.Name, responses.data.Character.Server);
                //     if (Lang) responses.data.Character.Lang = Lang;
                //     else console.log("Still cant find Language data!");
                // }
                return returned;
            }
        }   
        catch(error){
            console.log(error)
            //console.log("Unknown error happened when retrieving character data.");
        }
    }
    
    let default_URL = "https://xivapi.com/character/";
    let search_by_name = "search?name=";
    let contents = null;
    let Lang = null;
    let has_server = false;
    let has_data_center = false;
    let has_server_region = false;
    //with flag means input is inner function call from current/other file, without flag means input is ~find command.
    if(!flag){
        contents = message.content.replace("~find",'').split(/[ %20]+/).splice(1);
    }
    else{
        if(lodestone > 0){
            contents = [lodestone];
        }
        else{
            contents = character_name.split(/[ %20]+/);
            if(server !== ''){
                has_server = true;
                contents.push(server);
            }  
            else if(datacenter != ''){
                has_data_center = true;
                contents.push(datacenter);
            } 
            else if(server_region != ''){
                
                has_server_region = true;
                contents.push(server_region);
            }  
             
        }            
    }
    console.log(contents)
    if(contents.length === 1){ // ff14 lodestone id
        console.log("Pass1")
        return await get(message, add_private_key(default_URL + contents[0]));
    }
    else if(contents.length === 2){ // characterFname characterLname
        console.log("Pass2")
        let count = 0;
        let result = undefined;
        for (server in server_list){
            if(count > 1){// if we found the same name appear in the different server, asking for server attribute
                timeout_send(message, "Need additional parameter to locate exact character: [server]");
                console.log("Need additional parameter to locate exact character: [server]");
                return;
            }
            result = await get(message, add_private_key(default_URL + search_by_name + contents[0] + "%20" + contents[1] + `&server=${server_list[server]}`)
            , contents[0] + ' ' + contents[1]);
            if (result !== undefined){count++;}
        }
        return result;
        // return await get(message, add_private_key(default_URL + search_by_name + contents[0] + "%20" + contents[1]) 
        //                 , contents[0] + ' ' + contents[1]);
    }
    else if(contents.length === 3){ // characterFname characterLname server/datacenter/server_region
        console.log("Pass3")
        let count = 0;
        let result = undefined;
        if(!has_server){            
            if(has_data_center){
                if(data_centers.findIndex((elem)=>elem.toLowerCase() === contents[2].toLowerCase()) === -1){
                    console.log("Code: F02. Invalid Datacenter in find_character() function.");
                        return;
                }
                let servers = dc_server[contents[2]]
                for (server in servers){
                    if(count > 1){// if we found the same name appear in the different server, asking for server attribute
                        timeout_send(message, "Need additional parameter to locate exact character: [server]");
                        console.log("Need additional parameter to locate exact character: [server]");
                        return;
                    }
                    result = await get(message, add_private_key(default_URL + search_by_name + contents[0] + "%20" + contents[1] + `&server=${servers[server]}`)
                    , contents[0] + ' ' + contents[1]);
                    if (result !== undefined){count++;}
                }
                return result;
            }
            else if(has_server_region){
                if(server_regions.findIndex((elem)=>elem.toLowerCase() === contents[2].toLowerCase()) === -1){
                    console.log("Code: F03. Invalid Server Region in find_character() function.");
                        return;
                }
                let datacenters = region_dc[contents[2]];
                for (datacenter in datacenters){
                    let servers = dc_server[datacenters[datacenter]]
                    for (server in servers){
                        if(count > 1){// if we found the same name appear in the different server, asking for server attribute
                            timeout_send(message, "Need additional parameter to locate exact character: [server]");
                            console.log("Need additional parameter to locate exact character: [server]");
                            return;
                        }
                        result = await get(message, add_private_key(default_URL + search_by_name + contents[0] + "%20" + contents[1] + `&server=${servers[server]}`)
                        , contents[0] + ' ' + contents[1]);
                        if (result !== undefined){count++;}
                    }
                }
                return result;
            }
            else{
                throw `Code:F99. Third parameter unkonwn, check parameters of functions such as space in/before/after character name`
            }
        }
        else{
            if(server_list.findIndex((elem)=>elem.toLowerCase() === contents[2].toLowerCase()) === -1){
                console.log("Code: F01. Invalid Server Name in find_character() function.");
                    return;
            }
            
            return await get(message, add_private_key(default_URL + search_by_name + contents[0] + "%20" + contents[1] + `&server=${contents[2]}`)
                , contents[0] + ' ' + contents[1]);
        }
        // no valid character with the same name:
        //https://xivapi.com/character/search?name=luna%20stars&server=Famfrit&private_key=d33f1c9eec7b482eacfdecd4274ccec60917e5d0a146488490057830a3becfa2
        
    }
    else{
        timeout_send(message, "Incorrect format!");
        help();
        return;
    }

}

module.exports = {
    find_character: find_character,
}

// async function test(){
//     // console.log(await get(message, "https://xivapi.com/character/search?name=luna%20stars&server=Famfrit&private_key=d33f1c9eec7b482eacfdecd4274ccec60917e5d0a146488490057830a3becfa2"
//     // , character_name="luna stars"));
//     console.log(await find_character("A", flag=true, lodestone=-1, character_name='Joe Joe', server='', datacenter='', server_region=''))
//   }
//   test()