const express = require('express')
const app = express();
const axios = require('axios');

const {act_auto} = require('./act_auto_fflogs.js');
const {hello} = require('./bot_main.js');
const Port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/", (req, res)=>{
    res.sendFile(__dirname + '/public/index.html');
})

app.post("/wakeup", (req, res)=>{
    // console.log(req.body)
    let time = new Date().toString();
    let msg = `Received ${req.body.Hello} message at ${time}`;
    console.log(req);
    res.status(200);
    res.send(msg);
    
    setTimeout(()=>{wakeup()}, 60000);
    
})

app.post("/auto", (req, res)=>{
    // console.log(req.body)
    body = req.body;
    let message = {};
    message.content = `~auto ${body.character} ${body.webhook}`;
    // console.log(message)
    act_auto(message);
    res.status(200);
    res.send(`Player received: ${body.character}\nWebhook received: ${body.webhook}`);
})


app.listen(Port, (error)=>{
    if(error) console.log(`Error occurs when listening to port ${Port}`, error)
    else console.log(`Listening to port ${Port}`)
})

function wakeup(){
    axios.post('https://discord-ff14.herokuapp.com/wakeup', {'Hello': hello})
    .then(function(response) {
        console.log(response.body);
    })
    .catch(function (error) {
        console.log(error);
    });
}

setTimeout(()=>{wakeup()}, 10000);


