

class FluentFFlogs{
    constructor(jsonData) {
      this.data = jsonData;
    }
  
    //fromEncounter(fight_name: string): FluentFFlogs
    fromEncounter(fight_name) {
      let result_array = this.data.filter(function(inputObj){
      if(inputObj!== undefined){
        if(getProperty(inputObj, 'encounterName').found){
          if(getProperty(inputObj, 'encounterName').value === fight_name){
            return inputObj;
          }
        }
        }
      });
      return new FluentFFlogs(result_array);
    }
  
    //spec_name(roleName: string): FluentFFlogs // such as "scholar"
    spec_name(roleName){
      let result_array = this.data.filter(function(inputObj){
      if(inputObj!== undefined){
        if(getProperty(inputObj, 'spec').found){
          if(getProperty(inputObj, 'spec').value === roleName){
            return inputObj;
          }
        }
        }
      });
      return new FluentFFlogs(result_array);
    }
  
    //difficulty(difficulty: number): FluentFFlogs   difficulty = 100 => normal; difficulty = 101 => savage;
    difficulty(difficulty){
      let result_array = this.data.filter(function(inputObj){
      if(inputObj!== undefined){
        if(getProperty(inputObj, 'difficulty').found){
          if(getProperty(inputObj, 'difficulty').value === difficulty){
            return inputObj;
          }
        }
        }
      });
      return new FluentFFlogs(result_array);
    }
  
    //percentileLeq(rating: number): FluentFFlogs
    percentileLeq(rating){
      let result_array = this.data.filter(function(inputObj){
      if(inputObj!== undefined){
        if(getProperty(inputObj, 'percentile').found){
          if(getProperty(inputObj, 'percentile').value <= rating){
            return inputObj;
          }
        }
        }
      });
      return new FluentFFlogs(result_array);
    }
  
    //percentileLeq(rating: number): FluentFFlogs
    percentileLeq(rating){
      let result_array = this.data.filter(function(inputObj){
      if(inputObj!== undefined){
        if(getProperty(inputObj, 'percentile').found){
          if(getProperty(inputObj, 'percentile').value >= rating){
            return inputObj;
          }
        }
        }
      });
      return new FluentFFlogs(result_array);
    }
  
    highest_percentile(){
      let result_array = {};
      result_array = this.data.reduce(function(acc, elem){
      if(acc !== undefined && elem !== undefined){
        if(getProperty(acc, 'percentile').found && getProperty(elem, 'percentile').found){// check whether both have stars field
          let target_value = getProperty(elem, 'percentile').value;
          let orginal_value = getProperty(acc, 'percentile').value;
          if(target_value > orginal_value){//if new one have higher rating return new one
            return elem;
          }
          else if(target_value <= orginal_value){//if new one have lower rating return new one
            return acc;
          }
          else{console.log("Error in percentile field");}
        }
        }
      },{percentile: -1});
      return result_array;
    }
  
    print_highest_percentile(encounter, difficulty){
      let root = this;
      return new Promise(async function(resolve, rejects){
        let result_array = root.fromEncounter(encounter.encounterName);
        if(result_array.length = 0){rejects(`No fight record fit in this fight: ${encounter.encounterName}`);}
  
        result_array = result_array.difficulty(difficulty);
        if(difficulty === 100) {difficulty = "normal";}
        else if(difficulty === 101) {difficulty = "savage";}
        else{rejects(`error to find fight mode number: ${difficulty}, please choose from 100(normal)/101(savage)!`);}
        if(result_array.length = 0){rejects(`No fight record fit in this difficulty: ${difficulty}`);}
  
        result_array = result_array.highest_percentile();
        if(Object.getOwnPropertyNames(result_array).length === 0){rejects("No fight record fit in this condition.");}
        if(Object.getOwnPropertyNames(result_array).length > 19){rejects("Error happened in highest_percentile, more porperties appeared.");}
        if(result_array.percentile === -1){rejects(`Character: ${result_array.characterName}, has no record fit in this fight: ${encounter.encounterName}, in this difficulty: ${difficulty}`);}
        // console.log(result_array)
        return resolve({
                  characterName: result_array.characterName, 
                  spec:result_array.spec, 
                  fight: encounter.encounterName, 
                  difficulty: difficulty, 
                  percentile: Math.round(result_array.percentile).toString(), 
                  total_dps: result_array.total.toString()
                });
      });
    }
    
    print(){
      this.data.forEach(element => console.log(element));
    
    }
}

class ff14{
    constructor(){
        this.lodestone = undefined;
        this.server_region = undefined;
        this.data_center = undefined;
        this.server = undefined; 
        this.character_name = undefined;
        this.character_avatar = undefined;
    }
    set_lodestone(input){this.lodestone = input; return this;}
    set_character_name(input){this.character_name = input; return this;}
    set_character_avatar(input){this.character_avatar = input; return this;}
    set_server_region(input){this.server_region = input; return this;}
    set_data_center(input){this.data_center = input; return this;}
    set_server(input){this.server = input; return this;}
    
    get_lodestone(){return this.lodestone;}
    get_character_name(){return this.character_name;}
    get_character_avatar(){return this.character_avatar;}
    get_server_region(){return this.server_region;}
    get_data_center(){return this.data_center;}
    get_server(){return this.server;}
    
    out_json(){
        return {lodestone: this.lodestone,
                server_region: this.server_region,
                data_center: this.data_center,
                server: this.server,
                character_name: this.character_name,
                character_avatar: this.character_avatar,}
    }

    in_json(msgs){// {data_center:**, server:**,character_name:**}
        return new ff14().set_lodestone(msgs.lodestone).set_character_name(msgs.character_name).set_character_avatar(msgs.character_avatar)
                         .set_server_region(msgs.server_region).set_data_center(msgs.data_center).set_server(msgs.server);
    }
}
  
class user{
    constructor(){
        this.data = {username: undefined,
                     userID: undefined,
                     message: [],
                     playlist: [],
                     role_list: [],
                     ff14: [false, new ff14()],};
    }
    create_new(client_msgs){
        fs.writeFile ("./msgs.json", JSON.stringify (client_msgs, null, 4), err =>{
            if(err) throw err;
        });
    }
    set_name(input){this.data.username = input; return this;}
    set_userID(input){this.data.userID = input; return this;}
    //set_message(input){this.data.message.push(input); return this;}
    //set_playlist(input){this.data.playlist.push(input); return this;}
    //set_role_list(input){this.data.role_list.push(input); return this;}
    set_message(input){this.data.message = (input); return this;}
    set_playlist(input){this.data.playlist = (input); return this;}
    set_role_list(input){this.data.role_list = (input); return this;}
    set_ff14(input){this.data.ff14 = [true, input]; return this;}

    get_name(){return this.data.username;}
    get_userID(){return this.data.userID;}
    get_message(){return this.data.message;}
    get_playlist(){return this.data.playlist;}
    get_role_list(){return this.data.permission;}
    get_ff14(){return this.data.ff14;}
  
    out_json(){
        return {userName: this.get_name(),
                userID: this.get_userID(),
                message: this.get_message(),
                playlist: this.get_playlist(),
                ff14: this.get_ff14()[1].out_json()};
    }

    in_json(msgs){// msgs is a user {userID:**,message:[],playlist:[],ff14:ff14}
        return new user().set_name(msgs.username)
                         .set_userID(msgs.userID)
                         .set_message(msgs.message)
                         .set_playlist(msgs.playlist)
                         .set_ff14(msgs.ff14);
    }
}


exports.FluentFFlogs = FluentFFlogs;
exports.ff14 = ff14;
exports.user = user;