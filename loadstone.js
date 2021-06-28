const {server_list,timeout_send,help} = require('./Classes.js');
const axios = require('axios');


let loadstone_private_key = `&private_key=${process.env.LOADSTONE_PRIVATE_KEY}`;
function add_private_key(URL) {return URL + loadstone_private_key;};

module.exports = {
    find_character: async function (message, flag=false, lodestone=-1, character_name='', server=''){
        // Language data now is ignored, since XIVAPI set all of them to NULL when accessing player data.
        async function process(message, responses, character_name, server_name){
            let data = responses.data;
            //console.log(responses)
            if(data.Pagination.ResultsTotal === 1){
                let ID = data.Results[0].ID;
                // Lang = data.Results[0].Lang;
                return await get(message, add_private_key(default_URL + ID));
            }
            else{
                if(server_name === undefined){
                    timeout_send(message, "need additional parameter to locate exact character. [server]");
                    console.log("need additional parameter to locate exact character. [server]");
                    return;
                }
                
                for(result in data.Results){
                    //console.log(`result.Name: ${data.Results[result].Name}, character_name: ${character_name}`);
                    if(data.Results[result].Name.localeCompare(character_name) === 0 ){
                        let ID = data.Results[result].ID;
                        // Lang = data.Results[result].Lang;
                        return await get(message, add_private_key(default_URL + ID));
                    }
                }
            }

            console.log(`No valid character found with name ${character_name} in server ${server_name}`);
            return;
        }

        async function get(message, URL, character_name="", server_name=""){
            try{
                let responses = await axios.get(URL);
                if(character_name !== ""){
                    return await process(message, responses, character_name, server_name);
                }
                else{
                    let returned = responses.data.Character;
                    // if(flag){
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
        //with flag means input is inner function call from current/other file, without flag means input is ~find command.
        if(!flag){
            contents = message.content.replace("~find",'').split(' ').splice(1);
        }
        else{
            if(lodestone > 0){
                contents = [lodestone];
            }
            else{
                contents = character_name.split(' ');
                contents.push(server);
            }
            
        }
        
        if(contents.length === 1){ // ff14 lodestone id
            return await get(message, add_private_key(default_URL + contents[0]));
        }
        else if(contents.length === 2){ // characterFname characterLname
            return await get(message, add_private_key(default_URL + search_by_name + contents[0] + "%20" + contents[1]) 
                            , contents[0] + ' ' + contents[1]);
        }
        else if(contents.length === 3){ // characterFname characterLname server
            if(server_list.findIndex((elem)=>elem.toLowerCase() === contents[2].toLowerCase()) === -1){
                console.log("No valid server name detacted in find_character() function.");
                return;
            }
            return await get(message, add_private_key(default_URL + search_by_name + contents[0] + "%20" + contents[1] + `&server=${contents[2]}`)
                    , contents[0] + ' ' + contents[1], contents[2]);
        }
        else{
            timeout_send(message, "Incorrect format!");
            help();
            return;
        }

    },
}