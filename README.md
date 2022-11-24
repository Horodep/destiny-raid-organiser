# mamanda
This is a discord bot created to manage raid appointments in the game Destiny 2.

## Short list of commands:
* create raid;
* check in/out;
* change raid time;
* cancel raid;
* kick/add a teammate;
* notafications;
* custom tags.

## example config.json
```json
{
    "_comment": "This is an example file. Here should be your data.",
    
    "credentials":{
        "discordApiKey" : "qwerqwrqwrwqerqwrqwerqwrqwerqwerqwreqwerqwerqwrqwerqwrqwrqwrqw",
        "is_production" : false
    },
    
    "guilds"        :{
        "operational"   : [
            "000000000000000000",
            "000000000000000000"
        ], 
        "emojis"        : "000000000000000000"
    },
    "users"         :{
        "developers"    : [
            "000000000000000000"
        ]
    },
    "roles"         :{
        "everyone"      : "000000000000000000"
    },
    "channels"      :{
        "raids"         : [
            "000000000000000000",
            "000000000000000000"
        ],
        "sandbox"       : "000000000000000000"
    }
 }
```