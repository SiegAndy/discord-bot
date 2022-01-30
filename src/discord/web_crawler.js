
const cheerio = require('cheerio');
const axios = require('axios');



module.exports = {
    loadstone_character_pic: async function(loadstone_id){
        //return a picture link.
        let URL = `https://na.finalfantasyxiv.com/lodestone/character/${loadstone_id}/`
        //let URL = `https://na.finalfantasyxiv.com/lodestone/character/25526101/`
        console.log("Visiting page: " + URL);
        try {
            return await axios.get(URL).then((res)=>{
                var $ = cheerio.load(res.data);
                return $('.js__image_popup').children('img').first().attr('src');
            });
        } catch (error) {
            if(error.response.status === 404){
                console.log("Invalid loadstone_id");
                return;
            }
            console.log("Unknown error occured in loadstone_character_pic() function");
            return;
        }        
    }
}