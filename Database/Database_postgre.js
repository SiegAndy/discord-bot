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

        this.con.query(`CREATE TABLE IF NOT EXISTS `+ this.usertable +`(discord_id BIGINT NOT NULL, privilege INT NOT NULL, discord_name VARCHAR(32)
                                                        , PRIMARY KEY(discord_id))`
        , function (err, result) {
            if (err) throw err; console.log(`TABLE discord_user created/existed`);});   

        this.con.query(`CREATE TABLE IF NOT EXISTS `+ this.ff14table +`(discord_id BIGINT NOT NULL, ff14_loadstone BIGINT NOT NULL, Fname VARCHAR(32), Lname VARCHAR(32)
                                                        , Server VARCHAR(32), DataCenter VARCHAR(32), Region VARCHAR(32)
                                                        , FOREIGN KEY(discord_id) REFERENCES `+ this.usertable +`(discord_id) ON DELETE CASCADE ON UPDATE CASCADE
                                                        , PRIMARY KEY(ff14_loadstone, discord_id))`
        , function (err, result) {
        if (err) throw err; console.log(`TABLE ff14_user created/existed`);});
    }

    fetch(discord_id){ // 3:master/superuser, 2:admin, 1:collaborators, 0:users
        let pool=this.con
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

    user_info(discord_id){ // taking discord_id which is PK for discord_user table for other info
        let pool = this.con;
        return new Promise((resolve, rejects) =>
        // discord_user.discord_id, privilege, discord_name, ff14_user.ff14_loadstone 
            pool.query(`SELECT *
                                FROM discord_user, ff14_user 
                                WHERE discord_user.discord_id=$1 
                                    AND discord_user.discord_id=ff14_user.discord_id`
            , [discord_id]
            , async function (err, result, fields) {
                if (err) rejects (err);
                resolve(result);
            })            
        );        
    }

    insert(discord_id, privilege=0, discord_name=null, ff14_loadstone=-1, Fname='', Lname='', Server='', DataCenter='', Region=''){
        
        this.con.query(`INSERT INTO `+ this.usertable +`(discord_id, privilege, discord_name) VALUES($1, $2, $3)`
                , [discord_id, privilege, discord_name] 
                , function (err, result, fields) {if (err) throw err;});

        if (ff14_loadstone !== -1){
            this.insert_ff14(discord_id, ff14_loadstone, Fname, Lname, Server='', DataCenter='', Region='');
        }

    }

    insert_ff14(discord_id, ff14_loadstone=-1, Fname='', Lname='', Server='', DataCenter='', Region=''){
        if(ff14_loadstone > 0){
            this.con.query(`INSERT INTO `+ this.ff14table +`(discord_id, ff14_loadstone, Fname, Lname, Server, DataCenter, Region) 
                                VALUES($1, $2, $3, $4, $5, $6, $7)`
            , [discord_id, ff14_loadstone, Fname, Lname, Server, DataCenter, Region] 
            , function (err, result, fields) {if (err) throw err;});
        }    
        else{return "Unable to insert, please enter valid loadstone number!";}    
    }

    update(discord_id, privilege=0, discord_name=null, flag=false, ff14_loadstone=-1, Fname='', Lname='', Server='', DataCenter='', Region=''){
        //flag = true means need to update the part of ff14 info
        this.con.query(`UPDATE `+ this.usertable +` SET privilege=$1, discord_name=$2 WHERE discord_id=$3`
        , [privilege, discord_name, discord_id] 
        , function (err, result, fields) {if (err) throw err;});

        if (flag){
            update_ff14(discord_id, ff14_loadstone, Fname, Lname, Server, DataCenter, Region);
        }
    }

    update_ff14(discord_id, ff14_loadstone, Fname='', Lname='', Server='', DataCenter='', Region=''){

        this.con.query(`UPDATE `+ this.ff14table +` SET discord_id=$1, ff14_loadstone=$2, Fname=$3, Lname=$4
                                                        , Server=$5, DataCenter=$6, Region=$7`
        , [discord_id, ff14_loadstone, Fname, Lname, Server, DataCenter, Region] 
        , function (err, result, fields) {if (err) throw err;});
    }

    delete(discord_id, ff14_loadstone=-1){       
        if (ff14_loadstone > 0){this.delete_ff14(discord_id, ff14_loadstone);}
        this.con.query(`DELETE FROM `+ this.usertable +` WHERE discord_id=$1`
        , [discord_id] 
        , function (err, result, fields) {if (err) throw err;});
    }

    async delete_ff14(discord_id, ff14_loadstone){
        let content = null, pool = this.con;
        try {
            content = await new Promise((resolve, rejects) => 
                    pool.query(`SELECT * FROM `+ this.ff14table +` WHERE discord_id=$1 AND ff14_loadstone=$2`
                    , [discord_id,ff14_loadstone] 
                    , function (err, result, fields) {
                        if (err) rejects(err); 
                        resolve(result);
                    }));
        } catch (error) {console.log("Error happened in try-catch block in delete_ff14!");}
        
        if (content === null || content.length() === 0){console.log("Unable to process, no refering ff14 character linked!"); return;}             
        
        this.con.query(`DELETE FROM `+ this.ff14table +` WHERE discord_id=$1 AND ff14_loadstone=$2`
        , [discord_id, ff14_loadstone] 
        , function (err, result, fields) {if (err) throw err;});

    }

    destroy(){
        this.con.end(function(err) {
            if (err) {console.log(`error: + ${err.message}`); return;}
            console.log('Close the database connection.');
        });
    }
}

exports.Database = Database;