const mysql = require('mysql');
require('dotenv').config({path: "C:/Users/zc470/Desktop/Extra/Discord-bot/.env"});

class Database{
    constructor() {
        this.con = mysql.createConnection({
            host: "localhost",
            user: process.env.DATABASE_USR,
            password: process.env.DATABASE_PWD
        })

        this.database = 'discord_database'
        this.usertable = 'discord_database.discord_user';
        this.ff14table = 'discord_database.ff14_user';
        this.referstable = 'discord_database.refers';

        this.con.connect(function(err){if(err) throw err; console.log("Connected!");});

        this.con.query("CREATE DATABASE IF NOT EXISTS ??", [this.database], function (err, result) {
            if (err) throw err; console.log(`Database discord_database created/existed`);});

        this.con.query(`CREATE TABLE IF NOT EXISTS ?? (discord_id BIGINT NOT NULL, privilege INT NOT NULL, discord_name VARCHAR(32)
                                                        , PRIMARY KEY(discord_id))`
        , [this.usertable], function (err, result) {
            if (err) throw err; console.log(`TABLE discord_user created/existed`);});   

        this.con.query(`CREATE TABLE IF NOT EXISTS ?? (discord_id BIGINT, ff14_loadstone BIGINT
                                                        , FOREIGN KEY(discord_id) REFERENCES ??(discord_id) ON DELETE CASCADE ON UPDATE CASCADE
                                                        , PRIMARY KEY(ff14_loadstone, discord_id))`
        , [this.referstable,this.usertable], function (err, result) {
        if (err) throw err; console.log(`TABLE refers created/existed`);});

        this.con.query(`CREATE TABLE IF NOT EXISTS ?? (ff14_loadstone BIGINT NOT NULL
                                                        , Fname VARCHAR(64), Lname VARCHAR(64)
                                                        , FOREIGN KEY(ff14_loadstone) REFERENCES ??(ff14_loadstone) ON DELETE CASCADE ON UPDATE CASCADE
                                                        , PRIMARY KEY(ff14_loadstone))`
        , [this.ff14table, this.referstable], function (err, result) {
            if (err) throw err;console.log(`TABLE ff14_user created/existed`);});
        
        this.con.commit();
    }

    fetch(privilege){ // 3:master/superuser, 2:admin, 1:collaborators, 0:users
        if (privilege < 1){return "You don't have privilege for this operatoin, please contact SiegAndy#2157 for furthur information!";}
        return new Promise((resolve, rejects) =>
            // this.con.query("SELECT ?, discord_name, ?, ff14_loadstone FROM ??, ??, ?? WHERE ?=? AND ?=? "
            // , [`${this.usertable}.discord_id`, `${this.ff14table}.discord_refers`
            //     , this.usertable, this.ff14table, this.referstable
            //     , `${this.usertable}.discord_id`, `${this.referstable}.discord_id`
            //     , `${this.referstable}.discord_refers`, `${this.ff14table}.discord_refers`]
            this.con.query(`SELECT discord_database.discord_user.discord_id, discord_name, discord_database.ff14_user.ff14_loadstone 
                            FROM discord_database.discord_user, discord_database.ff14_user, discord_database.refers 
                            WHERE discord_database.discord_user.discord_id=discord_database.refers.discord_id 
                                AND discord_database.refers.ff14_loadstone=discord_database.ff14_user.ff14_loadstone`
            , function (err, result, fields) {
                if (err) rejects(err);
                resolve(result);
            }) 
        );
    }

    user_info(discord_id){ // taking discord_id which is PK for discord_user table for other info
        return new Promise((resolve, rejects) =>
            this.con.query(`SELECT discord_database.discord_user.discord_id, privilege, discord_name, discord_database.refers.ff14_loadstone 
                                FROM discord_database.discord_user, discord_database.refers 
                                WHERE discord_database.discord_user.discord_id=? 
                                    AND discord_database.discord_user.discord_id=discord_database.refers.discord_id`
            , [discord_id]
            , async function (err, result, fields) {
                if (err) rejects (err);
                resolve(result);
            })            
        );        
    }

    insert(discord_id, privilege=0, discord_name=null, ff14_loadstone=-1, Fname='', Lname=''){
        
        this.con.query("INSERT INTO ??(discord_id, privilege, discord_name) VALUES(?, ?, ?)"
                , [this.usertable, discord_id, privilege, discord_name] 
                , function (err, result, fields) {if (err) throw err;});

        if (ff14_loadstone !== -1){
            this.insert_ff14(discord_id, ff14_loadstone, Fname, Lname, 0);
        }

        this.con.commit();
    }

    async insert_ff14(discord_id, ff14_loadstone=-1, Fname='', Lname=''){
        let content = null;
        try {
            content = await this.user_info(discord_id);
        } catch (error) {throw error;}

        if(content !== null && ff14_loadstone > 0){

            this.con.query("INSERT INTO ??(discord_id, ff14_loadstone) VALUES(?, ?)"
            , [this.referstable, discord_id, ff14_loadstone] 
            , function (err, result, fields) {if (err) throw err;});

            this.con.query("INSERT INTO ??(ff14_loadstone, Fname, Lname) VALUES(?, ?, ?)"
            , [this.ff14table, ff14_loadstone, Fname, Lname] 
            , function (err, result, fields) {if (err) throw err;});
        }        
       
        this.con.commit();
    }

    update(discord_id, privilege=0, discord_name=null, flag=false, ff14_loadstone=-1, Fname='', Lname=''){
        //flag = true means need to update the part of ff14 info
        this.con.query("UPDATE ?? SET privilege=?, discord_name=? WHERE discord_id=?"
        , [this.usertable, privilege, discord_name, discord_id] 
        , function (err, result, fields) {if (err) throw err;});

        if (flag){
            update_ff14(discord_id, ff14_loadstone, Fname, Lname);
        }

        this.con.commit();
    }

    update_ff14(discord_id, ff14_loadstone, Fname='', Lname=''){

        this.con.query("UPDATE ?? SET discord_id, ff14_loadstone) VALUES(?, ?)"
        , [this.referstable, discord_id, ff14_loadstone] 
        , function (err, result, fields) {if (err) throw err;});

        this.con.query("UPDATE ?? SET Fname=?, Lname=? WHERE ff14_loadstone=?"
        , [this.ff14table, Fname, Lname, ff14_loadstone] 
        , function (err, result, fields) {if (err) throw err;});     

        this.con.commit();   
    }

    delete(discord_id, ff14_loadstone=-1){       
        if (ff14_loadstone > 0){this.delete_ff14(discord_id, ff14_loadstone);}
        this.con.query("DELETE FROM ?? WHERE discord_id=?"
        , [this.usertable, discord_id] 
        , function (err, result, fields) {if (err) throw err;});
        this.con.commit();
    }

    async delete_ff14(discord_id, ff14_loadstone){
        let content = null;
        try {
            content = await new Promise((resolve, rejects) => 
                    this.con.query("SELECT * FROM ?? WHERE discord_id=? AND ff14_loadstone=?"
                    , [this.ff14table, discord_id,ff14_loadstone] 
                    , function (err, result, fields) {
                        if (err) rejects(err); 
                        resolve(result);
                    }));
        } catch (error) {console.log("Error happened in try-catch block in delete_ff14!");}
        
        if (content === null || content.length() === 0){console.log("Unable to process, no refering ff14 character linked!"); return;}             

        this.con.query("DELETE FROM ?? WHERE discord_id=? AND ff14_loadstone=?"
        , [this.referstable, discord_id, ff14_loadstone] 
        , function (err, result, fields) {if (err) throw err;});

        this.con.commit();
    }

    destroy(){
        this.con.end(function(err) {
            if (err) {console.log(`error: + ${err.message}`); return;}
            console.log('Close the database connection.');
        });
    }
}