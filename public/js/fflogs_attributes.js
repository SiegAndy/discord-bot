const attributes = require("../../Classes.js")

const server_list = attributes.server_list;
const datacenter_list = attributes.data_centers;

function copytoclipboard(input) {
    let copyText;
    if (input == 'xml'){
        copyText = document.getElementById("trigger");
    }     
    else{
        copyText = document.getElementById("attributes");
    }
        
  
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
  
    navigator.clipboard.writeText(copyText.value);
  
    // alert("Copied the text: " + copyText.value);
}

function reset_hook(){
    document.getElementById("webhook").value = 'mywebhook';
    updatebox()
}

function updatebox(){
    function check_update(id, key, value){
        if (document.getElementById(id).checked){
            result[key] = value;
        }
    }

    let textbox = document.getElementById('attributes');
    let result = JSON.parse(textbox.value);

    check_update('Current_raid_tier', 'combatZone', 'current raid tier');
    check_update('Ultimates', 'combatZone', 'ultimates');
    check_update('Both', 'combatZone', 'both');
    
    check_update('dps', 'metric', 'dps');
    check_update('hps', 'metric', 'hps');
    check_update('playerspeed', 'metric', 'playerspeed');

    check_update('without_echo', 'echo', 'no');
    check_update('with_echo', 'echo', 'yes');

    check_update('today', 'timeframe', 'today');
    check_update('historical', 'timeframe', 'historical');

    result['datacenter'] = document.getElementById('datacenter').value;
    result['server'] = document.getElementById('server').value;
    result['webhook'] = document.getElementById('webhook').value;

    textbox.value = JSON.stringify(result, null, "\t");
}
