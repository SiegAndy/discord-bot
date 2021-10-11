

const portAudio = require('naudiodon');
const {isEligible} = require('./Classes.js');

/* due to the fucking device addition, now the working command is ~relay 3
Voicemeter input should be line-in, and output should be Speaker virtual cable and Speaker Realtek.
The correct relay message should be following: (since virtual cable is connected to line-in of computer)
Input audio options: device 3, sample rate 48000, channels 2, bits per sample 16, max queue 2, frames per buffer 0, close on error true
Input device name is CABLE Output (VB-Audio Virtual
*/


const sampleRate = 48000;
let  audioDeviceId = null; //4 is virtual cable; 2 is voicemeeter
let portInfo = portAudio.getHostAPIs();
let defaultDeviceId = portInfo.HostAPIs[portInfo.defaultHostAPI].defaultOutput;
let defaultDevice = portAudio.getDevices().filter(device => device.id === defaultDeviceId);

// console.log(portAudio.getDevices())
let ai = null;
let voiceChannel = null;
let isActive = false;
let stream = new require('stream').Transform()
stream._transform = function (chunk, encoding, done) {
  this.push(chunk);
  done();
}

async function local_relay(message){
    console.log("=====================================================")
    if (!message.guild) return;
    if (message.author.bot) return;
    //audioDeviceId 4 is virtual cable; 2 is voicemeeter
    voiceChannel = message.member.voice.channel;      
    
    if(!isEligible(message,2)){return;}
    if(message.content.length <= 8){
        if (!voiceChannel) {message.reply('Please join a VoiceChannel first, then summon me.');return;}
        if(isActive){message.reply('I am already in a voice channel, please disconnect first then summon me.');return;}
        else if(!isActive){
            isActive = true;
            // Only try to join the sender's voice channel if they are in one themselves
            message.reply('At your service.');
            if(message.content.substring(7) === '1'){audioDeviceId = 1;}
            else if(message.content.substring(7) === '2'){audioDeviceId = 2;}
            else if(message.content.substring(7) === '3'){audioDeviceId = 3;}
            else if(message.content.substring(7) === '4'){audioDeviceId = 4;}
            else if(message.content.substring(7) === '5'){audioDeviceId = 5;}
            voiceChannel.join()
            .then(connection => {
                ai = new portAudio.AudioIO({
                    inOptions: {
                    channelCount: 2,
                    sampleFormat: portAudio.SampleFormat16Bit,
                    sampleRate: sampleRate,
                    deviceId: audioDeviceId !== null ? audioDeviceId : defaultDevice.id // Use -1 or omit the deviceId to select the default device
                    //deviceId: 2
                    }
                });
                // pipe the audio input into the transform stream and
                ai.pipe(stream);
                // the transform stream into the discord voice channel
                const dispatcher = connection.play(stream, {type: 'converted'});
                // start audio capturing
                ai.start();            
            
                dispatcher.on('debug', (info) => console.log(info));
                dispatcher.on('end', () => voiceChannel.leave());
                dispatcher.on('error', (error) => console.log(error));    
            })
            .catch(error => {
                console.log(error);
                message.reply(`Cannot join VoiceChannel, because ${error.message}`);
                isActive = false;
            });
        }      
    }
    // leave the channel
    else if (message.content ==='~relay quit') {
        if(!isActive){await message.reply(`I am not in the voice channel currently.`); return;}  
        voiceChannel.leave();
        isActive = false;
        message.reply('Leaving!');
        voiceChannel = undefined;
        ai.quit();
        ai.unpipe(stream);
    }
    else{message.reply(`Unknown input "${message.content}".`); return;}
}


    
exports.local_relay = local_relay;
