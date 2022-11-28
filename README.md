# destiny-raid-organiser
This is a discord bot created to manage raid appointments in the game Destiny 2.

## List of commands:
* `!сбор ДД.ММ ЧЧ:ММ название активности, комментарии`  
  создание сбора на активность на 6 человек;  
  create an appointment for 6 people;
* `!сбор ДД.ММ ЧЧ:ММ [N] название активности, комментарии`  
  создание сбора на активность на N человек;  
  create an appointment for N people;
* `!бронь @DiscordTag`  
  забронировать место за стражем, _должно быть ответом на сообщение рейда_  
  book a place for a guardian, _should be an answer to a raid message_
* `!отмена`  
  отмена рейда, _должно быть ответом на сообщение рейда_  
  cancel raid, _should be an answer to a raid message_
* `!перенос ДД.ММ ЧЧ:ММ`  
  перенос рейда, _должно быть ответом на сообщение рейда_  
  reschedule raid, _should be an answer to a raid message_
* `!комментарий новый комментарий`  
  изменить комментарий к рейду, _должно быть ответом на сообщение рейда_  
  change raid description, _should be an answer to a raid message_
* `!clean`  
  очистить канал от старых рейдов и лишних сообщений;  
  delete old and redundant messages from the raid channel;
* `!help`  
  список доступных команд;  
  list of commands;
* `!myraids`  
  список рейдов, в которые записался страж;  
  list of raids, guardian is going to participate in;

## example config.json
In guilds: id - guild id, mention - role id for glogal mentions, raids - raid channel id.
```json
{   
    "credentials":{
        "discordApiKey" : "qwerqwrqwrwqerqwrqwerqwrqwerqwerqwreqwerqwerqwrqwerqwrqwrqwrqw"
    },
    
    "dev_config":{
        "developer"        : "149245139389251584",
        "emojis"           : "799584344569806858",
        "sandbox_channel"  : "000000000000000000"
    },
     
    "guilds"        :[
        {
            "title"         : "guild1",
            "id"            : "000000000000000000",
            "mention"       : "000000000000000000",
            "ban"           : "000000000000000000",
            "raids"         : [
              "000000000000000000",
              "000000000000000000"
            ]
        },
        {
            "title"         : "guild2",
            "id"            : "000000000000000000",
            "mention"       : "000000000000000000",
            "ban"           : "000000000000000000",
            "raids"         : [
              "000000000000000000",
              "000000000000000000"
            ]
        }
    ]
 }
```