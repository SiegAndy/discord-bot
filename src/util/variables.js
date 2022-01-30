
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env')});


const FFLOGS_API_KEY = process.env.FFLOGS_API_KEY
const WEBHOOK = process.env.WEBHOOK
const DISCORD_TEST_APP_API_KEY = process.env.DISCORD_TEST_APP_API_KEY
const LOADSTONE_PRIVATE_KEY = process.env.LOADSTONE_PRIVATE_KEY


const prefix = "~";

const roleNames = {max: ['GM', 'Administrator',], second: ['GM', 'Administrator','Refugee','Tester',]};

const group_study_area_code = {
  '107628': 'L',
  '107629': 'M',
  '107630': 'N',
  '107631': 'O',
  '107632': 'P',
  '107633': 'Q',
  '107635': 'R',
  '107636': 'S',
  '107638': 'T',
  '107640': 'U',
  '107642': 'V',
  '107644': 'W',
  '107645': 'X',
  '107646': 'Y',
  '107647': 'Z',
}

const header_referer = {
  'headers':{
  'Content-Type': 'application/x-www-form-urlencoded',
  'Connection': 'keep-alive',
  'origin': 'https://libcal.library.umass.edu',
    'referer': 'https://libcal.library.umass.edu/spaces?lid=11076&gid=28495&c=0'
  }
}

const server_regions = ["NA","EU","JP"];

const data_centers = ["Aether","Chaos","Crystal","Elemental","Gaia","Light","Mana","Primal"]

const region_dc = {NA:['Aether','Crystal','Primal'],
                    EU:['Chaos','Light'],
                    JP:['Elemental','Gaia','Mana']
                  }

const region_dc_servers = {NA:{Aether:["Adamantoise","Cactuar","Faerie","Gilgamesh","Jenova","Midgardsormr","Sargatanas","Siren"]
                                 ,Crystal:["Balmung","Brynhildr","Coeurl","Diabolos","Goblin","Malboro","Mateus","Zalera"]
                                 ,Primal:["Behemoth","Excalibur","Exodus","Famfrit","Hyperion","Lamia","Leviathan","Ultros"]}
                            ,EU:{Chaos:["Cerberus","Louisoix","Moogle","Omega","Ragnarok","Spriggan"]
                                  ,Light:["Lich","Odin","Phoenix","Shiva","Zodiark","Twintania"]}
                            ,JP:{Elemental:["Aegis","Atomos","Carbuncle","Garuda","Gungnir","Kujata","Ramuh","Tonberry","Typhon","Unicorn"]
                                  ,Gaia:["Alexander","Bahamut","Durandal","Fenrir","Ifrit","Ridill","Tiamat","Ultima","Valefor","Yojimbo","Zeromus"]
                                  ,Mana:["Anima","Asura","Belias","Chocobo","Hades","Ixion","Mandragora","Masamune","Pandaemonium","Shinryu","Titan"]}
                            }

const dc_server = {Aether:["Adamantoise","Cactuar","Faerie","Gilgamesh","Jenova","Midgardsormr","Sargatanas","Siren"]
                        ,Chaos:["Cerberus","Louisoix","Moogle","Omega","Ragnarok","Spriggan"]
                        ,Crystal:["Balmung","Brynhildr","Coeurl","Diabolos","Goblin","Malboro","Mateus","Zalera"]
                        ,Elemental:["Aegis","Atomos","Carbuncle","Garuda","Gungnir","Kujata","Ramuh","Tonberry","Typhon","Unicorn"]
                        ,Gaia:["Alexander","Bahamut","Durandal","Fenrir","Ifrit","Ridill","Tiamat","Ultima","Valefor","Yojimbo","Zeromus"]
                        ,Light:["Lich","Odin","Phoenix","Shiva","Zodiark","Twintania"]
                        ,Mana:["Anima","Asura","Belias","Chocobo","Hades","Ixion","Mandragora","Masamune","Pandaemonium","Shinryu","Titan"]
                        ,Primal:["Behemoth","Excalibur","Exodus","Famfrit","Hyperion","Lamia","Leviathan","Ultros"]
                    }

const server_list = ["Adamantoise","Aegis","Alexander","Anima","Asura","Atomos"
                    ,"Bahamut","Balmung","Behemoth","Belias","Brynhildr"
                    ,"Cactuar","Carbuncle","Cerberus","Chocobo","Coeurl"
                    ,"Diabolos","Durandal","Excalibur","Exodus","Faerie"
                    ,"Famfrit","Fenrir","Garuda","Gilgamesh","Goblin"
                    ,"Gungnir","Hades","Hyperion","Ifrit","Ixion"
                    ,"Jenova","Kujata","Lamia","Leviathan","Lich"
                    ,"Louisoix","Malboro","Mandragora","Masamune"
                    ,"Mateus","Midgardsormr","Moogle","Odin","Omega"
                    ,"Pandaemonium","Phoenix","Ragnarok","Ramuh"
                    ,"Ridill","Sargatanas","Shinryu","Shiva","Siren"
                    ,"Tiamat","Titan","Tonberry","Typhon","Ultima"
                    ,"Ultros","Unicorn","Valefor","Yojimbo","Zalera"
                    ,"Zeromus","Zodiark","Spriggan","Twintania"]

//Ultimates 4.0
const zone_30 = {
  "id": 30,
    "name": "Ultimates (Stormblood)",
    "frozen": false,
    "encounters": [
      {
        "id": 1047,
        "name": "The Unending Coil of Bahamut"
      },
      {
        "id": 1048,
        "name": `    The Weapon's Refrain    `
      }
    ],
    "brackets": {
      "min": 5,
      "max": 5.5,
      "bucket": 0.1,
      "type": "Patch"
    },
    "partitions": [
      {
        "name": "Standard Comps",
        "compact": "Standard",
        "area": 1,
        "default": true
      },
      {
        "name": "Non-Standard Comps",
        "compact": "Non-Standard",
        "area": 1
      },
      {
        "name": "Standard Comps",
        "compact": "Standard",
        "default": true,
        "area": 2
      },
      {
        "name": "Non-Standard Comps",
        "compact": "Non-Standard",
        "area": 2
      },
      {
        "name": "Standard Comps",
        "compact": "Standard",
        "default": true,
        "area": 3
      },
      {
        "name": "Non-Standard Comps",
        "compact": "Non-Standard",
        "area": 3
      }
    ]
}

//Ultimates 5.0
const zone_32 = {
  "id": 32,
  "name": "Ultimates",
  "frozen": false,
  "encounters": [
    {
      "id": 1050,
      "name": "    The Epic of Alexander   "
    }
  ],
  "brackets": {
    "min": 5,
    "max": 5.5,
    "bucket": 0.1,
    "type": "Patch"
  },
  "partitions": [
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "area": 1,
      "filtered_name": "5.1-5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 1
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "area": 2,
      "filtered_name": "5.1-5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 2
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "area": 3,
      "filtered_name": "5.1-5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 3
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 1
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 1
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 2
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 3
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 3
    },
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 1
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 1
    },
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 2
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 3
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 3
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 1,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5)",
      "area": 1
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 2,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 3,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5)",
      "area": 3
    }
  ]
}

//Ultimates 6.0
const zone_43 = {
  "id": 43,
  "name": "Ultimates",
  "frozen": false,
  "encounters": [
    {
      "id": 1060,
      "name": "The Unending Coil of Bahamut"
    },
    {
      "id": 1061,
      "name": "    The Weapon's Refrain    "
    },
    {
      "id": 1062,
      "name": "    The Epic of Alexander   "
    }
  ],
  "brackets": {
    "min": 6,
    "max": 6,
    "bucket": 0.1,
    "type": "Patch"
  },
  "partitions": [
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "area": 1,
      "default": true
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 1
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "default": true,
      "area": 2
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 2
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "default": true,
      "area": 3
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 3
    }
  ]
}

//E5-E8
const zone_33 = {
  "id": 33,
  "name": "Eden's Verse",
  "frozen": false,
  "encounters": [
    {
      "id": 69,
      "name": "Ramuh"
    },
    {
      "id": 70,
      "name": "Ifrit and Garuda"
    },
    {
      "id": 71,
      "name": "The Idol of Darkness"
    },
    {
      "id": 72,
      "name": "Shiva"
    }
  ],
  "brackets": {
    "min": 5,
    "max": 5.5,
    "bucket": 0.1,
    "type": "Patch"
  },
  "partitions": [
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "area": 1,
      "default": true,
      "filtered_name": "5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 1
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "default": true,
      "area": 2,
      "filtered_name": "5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 2
    },
    {
      "name": "Standard Comps",
      "compact": "Standard",
      "default": true,
      "area": 3,
      "filtered_name": "5.2"
    },
    {
      "name": "Non-Standard Comps",
      "compact": "Non-Standard",
      "area": 3
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 1
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 1
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 2
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.3)",
      "compact": "Standard (5.3)",
      "filtered_name": "5.3",
      "area": 3
    },
    {
      "name": "Non-Standard Comps (5.3)",
      "compact": "Non-Standard (5.3)",
      "area": 3
    }
  ]
}

//E9-E12
const zone_38 = {
  "id": 38,
  "name": "Eden's Promise",
  "frozen": false,
  "encounters": [
    {
      "id": 73,
      "name": ` Cloud of Darkness`
    },
    {
      "id": 74,
      "name": `   Shadowkeeper   `
    },
    {
      "id": 75,
      "name": `    Fatebreaker   `
    },
    {
      "id": 76,
      "name": `  Eden's Promise  `
    },
    {
      "id": 77,
      "name": `Oracle of Darkness`
    }
  ],
  "brackets": {
    "min": 5,
    "max": 5.5,
    "bucket": 0.1,
    "type": "Patch"
  },
  "partitions": [
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 1
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 1
    },
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 2,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.4)",
      "compact": "Standard (5.4)",
      "filtered_name": "5.4",
      "area": 3,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.4)",
      "compact": "Non-Standard (5.4)",
      "area": 3
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 1,
      "default": true
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5",
      "area": 1
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 2
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5)",
      "area": 2
    },
    {
      "name": "Standard Comps (5.5)",
      "compact": "Standard (5.5)",
      "filtered_name": "5.5",
      "area": 3
    },
    {
      "name": "Non-Standard Comps (5.5)",
      "compact": "Non-Standard (5.5)",
      "area": 3
    },
    {
      "name": "Standard Comps (Echo)",
      "compact": "Standard (Echo)",
      "filtered_name": "Echo",
      "area": 1
    },
    {
      "name": "Non-Standard Comps (Echo)",
      "compact": "Non-Standard (Echo)",
      "area": 1
    },
    {
      "name": "Standard Comps (Echo)",
      "compact": "Standard (Echo)",
      "filtered_name": "Echo",
      "area": 2
    },
    {
      "name": "Non-Standard Comps (Echo)",
      "compact": "Non-Standard (Echo)",
      "area": 2
    },
    {
      "name": "Standard Comps (Echo)",
      "compact": "Standard (Echo)",
      "filtered_name": "Echo",
      "area": 3
    },
    {
      "name": "Non-Standard Comps (Echo)",
      "compact": "Non-Standard (Echo)",
      "area": 3
    }
  ]
}

//P1-P4
const zone_44 = {"id": 44,
"name": "Asphodelos",
"frozen": false,
"encounters": [
  {
    "id": 78,
    "name": "   Erichthonios  "
  },
  {
    "id": 79,
    "name": "   Hippokampos   "
  },
  {
    "id": 80,
    "name": "     Phoinix     "
  },
  {
    "id": 81,
    "name": "     Hesperos    "
  },
  {
    "id": 82,
    "name": "    Hesperos II  "
  }
],
"brackets": {
  "min": 6,
  "max": 6,
  "bucket": 0.1,
  "type": "Patch"
},
"partitions": [
  {
    "name": "Standard Comps",
    "compact": "Standard",
    "area": 1,
    "default": true
  },
  {
    "name": "Non-Standard Comps",
    "compact": "Non-Standard",
    "area": 1
  },
  {
    "name": "Standard Comps",
    "compact": "Standard",
    "default": true,
    "area": 2
  },
  {
    "name": "Non-Standard Comps",
    "compact": "Non-Standard",
    "area": 2
  },
  {
    "name": "Standard Comps",
    "compact": "Standard",
    "default": true,
    "area": 3
  },
  {
    "name": "Non-Standard Comps",
    "compact": "Non-Standard",
    "area": 3
  }
]
}



exports.FFLOGS_API_KEY = FFLOGS_API_KEY;
exports.WEBHOOK = WEBHOOK;
exports.DISCORD_TEST_APP_API_KEY = DISCORD_TEST_APP_API_KEY;
exports.LOADSTONE_PRIVATE_KEY = LOADSTONE_PRIVATE_KEY;


exports.prefix = prefix;
exports.roleNames = roleNames;
exports.group_study_area_code = group_study_area_code;
exports.header_referer = header_referer;
exports.server_list = server_list;
exports.dc_server = dc_server;
exports.region_dc = region_dc;
exports.region_dc_servers = region_dc_servers;
exports.data_centers = data_centers;
exports.server_regions = server_regions;
exports.zone_30 = zone_30;
exports.zone_32 = zone_32;
exports.zone_43 = zone_43;
exports.zone_33 = zone_33;
exports.zone_38 = zone_38;
exports.zone_44 = zone_44;