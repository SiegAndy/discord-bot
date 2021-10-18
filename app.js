const express = require('express')
const app = express();
const {act_auto} = require('./act_auto_fflogs.js')

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));


app.post("/", (req, res)=>{
    console.log(req.body)
    body = req.body;
    let message = {};
    message.content = `~auto ${body.character} ${body.webhook}`;
    // console.log(message)
    act_auto(message);
})


app.listen(port, (error)=>{
    if(error) console.log(`Error occurs when listening to port ${port}`, error)
    else console.log(`Listening to port ${port}`)
})




