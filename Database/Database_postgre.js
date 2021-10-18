const {Pool, Client} = require('pg') // const Client = require('pg').Client
require('dotenv').config({path: "C:/Users/zc470/Desktop/Extra/Discord-bot/.env"});

class Database{
    constructor() {
        this.con = new Pool({
            host: process.env.HEROKU_HOST,
            user: process.env.HEROKU_USER,
            password: process.env.HEROKU_PASSWORD,
            port: '5432',
            database: process.env.HEROKU_DATABASE,
            ssl: {
              rejectUnauthorized: false
            }
        })
        
        this.usertable = 'discord_user';
        this.ff14table = 'ff14_user';        
        
        this.con.connect()
        .then(() => console.log("Connection successfuly"))
        .catch(e => console.log(e))

        this.con.query(`CREATE TABLE IF NOT EXISTS `+ this.usertable +`(discord_id VARCHAR(32), privilege INT NOT NULL, discord_name VARCHAR(32)
                                                        , PRIMARY KEY(discord_id))`
        , function (err, result) {
            if (err) throw err; console.log(`TABLE discord_user created/existed`);});   

        this.con.query(`CREATE TABLE IF NOT EXISTS `+ this.ff14table +`(discord_id VARCHAR(32), ff14_loadstone BIGINT NOT NULL, Fname VARCHAR(32), Lname VARCHAR(32)
                                                        , Server VARCHAR(32), DataCenter VARCHAR(32), Region VARCHAR(32)
                                                        , FOREIGN KEY(discord_id) REFERENCES `+ this.usertable +`(discord_id) ON DELETE CASCADE ON UPDATE CASCADE
                                                        , PRIMARY KEY(ff14_loadstone, discord_id))`
        , function (err, result) {
        if (err) throw err; console.log(`TABLE ff14_user created/existed`);});
        console.log("--------------------------------------------------")
        //console.log(this.con) 
    }

    async fetch(discord_id){ // 3:master/superuser, 2:admin, 1:collaborators, 0:users
        let pool=this.con; toString(discord_id);
        return new Promise(async function(resolve, rejects){
            let privilege=-1, content=null;
            try {
                content = await new Promise(async function(resolve, rejects){
                    pool.query(`SELECT discord_user.privilege FROM discord_user WHERE discord_user.discord_id=$1`, [discord_id]
                    , function (err, result, fields) {
                        if (err) rejects(err);
                        resolve(result);
                    });
                });
                privilege = content.rows[0].privilege;

            } catch (error) {rejects("Unable to execute fetch, cant find user and valid privilege info!");}   

            if (privilege < 1){rejects("You don't have privilege for this operatoin, please contact SiegAndy#2157 for furthur information!");}
            
            pool.query(`SELECT discord_user.discord_id, discord_name, ff14_user.ff14_loadstone 
                            FROM discord_user, ff14_user 
                            WHERE discord_user.discord_id=ff14_user.discord_id`
            , function (err, result, fields) {
                if (err) rejects(err);
                resolve(result);
            }) 
        });
    }

    async user_info(discord_id){ // taking discord_id which is PK for discord_user table for other info
        let pool = this.con; toString(discord_id);         
        return new Promise((resolve, rejects)=>{
            // console.log(discord_id)
            
        // discord_user.discord_id, privilege, discord_name, ff14_user.ff14_loadstone 
            let inner_pool = pool, inner_discord_id = discord_id;
            pool.query(`SELECT *
                                FROM discord_user, ff14_user 
                                WHERE discord_user.discord_id=$1 
                                    AND discord_user.discord_id=ff14_user.discord_id`
            , [discord_id]
            , async function (err, result, fields) {
                if (err) rejects (err);
                if(result.rowCount === 0){  
                    inner_pool.query(`SELECT *
                                            FROM discord_user 
                                            WHERE discord_user.discord_id=$1`
                    , [inner_discord_id]
                    , async function (err, result, fields) {
                        if (err) rejects (err);                        
                        resolve(result);
                    });
                }else{
                    resolve(result);
                }
                
            });  
        });        
    }

    async insert(discord_id, discord_name=null, privilege=0, ff14_loadstone=-1, Fname='', Lname='', Server='', DataCenter='', Region=''){
        let pool = this.con, usertable = this.usertable, ff14table = this.ff14table, insert_ff14 = this.insert_ff14; toString(discord_id);
        return new Promise(async function(resolve, rejects){
            let inner_ff14_loadstone = ff14_loadstone;
            pool.query(`INSERT INTO `+ usertable +`(discord_id, privilege, discord_name) VALUES($1, $2, $3)`
                    , [discord_id, privilege, discord_name] 
                    , function (err, result, fields) {
                        if (err) rejects(err);
                        if(inner_ff14_loadstone < 1) resolve(result)
                    });
                
            if(inner_ff14_loadstone > 0){
                try {resolve(await insert_ff14(discord_id, ff14_loadstone, Fname, Lname, Server, DataCenter, Region, pool, ff14table));} 
                catch (error) {rejects(error);}      
            }            
            
        });
    }

    async insert_ff14(discord_id, ff14_loadstone=-1, Fname='', Lname='', Server='', DataCenter='', Region='', connection=null , table=null){
        let pool = connection || this.con, ff14table = table || this.ff14table; toString(discord_id);
        return new Promise(async function(resolve, rejects){
            if(ff14_loadstone > 0){
                pool.query(`INSERT INTO `+ ff14table +`(discord_id, ff14_loadstone, Fname, Lname, Server, DataCenter, Region) 
                                    VALUES($1, $2, $3, $4, $5, $6, $7)`
                , [discord_id, ff14_loadstone, Fname, Lname, Server, DataCenter, Region] 
                , function (err, result, fields) {
                    if (err) rejects(err);
                    resolve(result);
                });
            }    
            else{rejects("Unable to insert, please enter valid loadstone number!");}    
        });
    }

    async update(discord_id, discord_name=null, privilege=0, flag=false, ff14_loadstone=-1, Fname='', Lname='', Server='', DataCenter='', Region=''){
        //flag = true means need to update the part of ff14 info
        let pool = this.con, usertable = this.usertable, ff14table = this.ff14table, update_ff14 = this.update_ff14; toString(discord_id);
        return new Promise(async function(resolve, rejects){
            let inner_flag = flag;
            pool.query(`UPDATE `+ usertable +` SET privilege=$1, discord_name=$2 WHERE discord_id=$3`
            , [privilege, discord_name, discord_id] 
            , function (err, result, fields) {
                if (err) rejects(err);
                if(!inner_flag) resolve(result);
            });
            
            if(flag){
                try {resolve(await update_ff14(discord_id, ff14_loadstone, Fname, Lname, Server, DataCenter, Region, pool, ff14table));} 
                catch (error) {rejects(error);}
            }
            
        });
    }

    async update_ff14(discord_id, ff14_loadstone, Fname='', Lname='', Server='', DataCenter='', Region='', connection=null, table=null){
        let pool = connection || this.con, ff14table = table || this.ff14table; toString(discord_id);
        return new Promise(async function(resolve, rejects){
            pool.query(`UPDATE `+ ff14table +` SET discord_id=$1, ff14_loadstone=$2, Fname=$3, Lname=$4
                                                            , Server=$5, DataCenter=$6, Region=$7`
            , [discord_id, ff14_loadstone, Fname, Lname, Server, DataCenter, Region] 
            , function (err, result, fields){
                if (err) rejects(err);
                resolve(result);
            });
        });
    }

    async delete(discord_id, ff14_loadstone=-1){      
        let pool = this.con, usertable = this.usertable; toString(discord_id);
        return new Promise(async function(resolve, rejects){ 
            if (ff14_loadstone > 0){this.delete_ff14(discord_id, ff14_loadstone);}
            pool.query(`DELETE FROM `+ usertable +` WHERE discord_id=$1`
            , [discord_id] 
            , function (err, result, fields) {
                if (err) rejects(err);
                resolve(result);
            });
        });
    }

    async delete_ff14(discord_id, ff14_loadstone){
        let pool = this.con, ff14table = this.ff14table; toString(discord_id);
        return new Promise(async function(resolve, rejects){ 
            let content = null, inner_pool=pool, inner_ff14table = ff14table;
            try {
                content = await new Promise((resolve, rejects) => 
                    inner_pool.query(`SELECT * FROM `+ inner_ff14table +` WHERE discord_id=$1 AND ff14_loadstone=$2`
                        , [discord_id,ff14_loadstone] 
                        , function (err, result, fields) {
                            if (err) rejects(err); 
                            resolve(result);
                        }));
            } catch (error) {rejects("Error happened in try-catch block in delete_ff14!");}
            
            if (content === null || content.length() === 0){rejects("Unable to process, no refering ff14 character linked!");}             
            
            pool.query(`DELETE FROM `+ ff14table +` WHERE discord_id=$1 AND ff14_loadstone=$2`
            , [discord_id, ff14_loadstone] 
            , function (err, result, fields) {
                if (err) rejects(err);
                resolve(result);
            });
        });

    }

    async destroy(){
        console.log("--------------------------------------------------");
        this.con.end(function(err) {            
            if (err) {console.log(`error: + ${err.message}`); return;}            
        });
        console.log('Close the database connection.');
    }
}

exports.Database = Database;