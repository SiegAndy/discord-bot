const http = require('http')
const fs = require('fs')
const express = require('express')
const app = express();

const port = 3000

class web_connection{
    constructor(){
        this.server = app;
        this.server.use(express.static('./Webpage'));
        this.server.get("/", (req, res)=>{
            res.sendFile('./Webpage/index.html');
        })
    }
    listen(port){
        this.server.listen(process.env.PORT || port, (error)=>{
            if(error) console.log(`Error occurs when listening to port ${port}`, error)
            else console.log(`Listening to port ${port}`)
        })
    }
}

exports.web_connection = web_connection;


