const express = require('express')
const app = express();
const axios = require('axios');

const {act_auto} = require('../discord/act_auto_fflogs.js');
const {hello} = require('../discord/bot_main.js');
const Port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/", (req, res)=>{
    res.sendFile(__dirname + '/public/index.html');
})

app.post("/wakeup", (req, res)=>{
    // console.log(req.body)
    console.log(`Received ${req.body.Hello} message at ${new Date().toString()}`);
    res.status(200);
    res.send('Received');
    setTimeout(()=>{wakeup()}, 1200000); //sending hello message for each 20 minute
})

app.get("/auto", (req, res)=>{
    res.sendFile(__dirname + '/public/act_auto.html');
})

app.post("/auto", async(req, res)=>{
    // console.log(req.body)
    body = req.body;
    // let message = {};
    // message.content = `~auto ${body.character} ${body.webhook}`;
    // // console.log(message)
    // act_auto(message);
    console.log('receiving request')

    act_auto(body).then((result)=>{
        res.status(200);
        res.send(`Player received: ${body.character}\nWebhook received: ${body.webhook}`);
    })
    .catch((error)=>{
        console.log(error)
        res.status(406);
        res.send(`Detail: ${error}`);
    })

     
    
})


app.listen(Port, (error)=>{
    if(error) console.log(`Error occurs when listening to port ${Port}`, error)
    else console.log(`Listening to port ${Port}`)
})

function wakeup(){
    let time = new Date().toString();
    axios.post('https://discord-ff14.herokuapp.com/wakeup', {'Hello': hello})
    .then(function(response) {
        if (response.data == 'Received'){console.log(`Hello message received by wakeup page at ${new Date().toString()}`);}
        else{console.log(`Unexpected message: ${response.data}`);}
    })
    .catch(function (error) {
        console.log(`Error happened when sending Hello message to wakeup page at ${time}`);
        // console.log(error);
    });
}

setTimeout(()=>{wakeup()}, 10000);


