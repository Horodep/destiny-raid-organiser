import config from "../config.json" assert {type: "json"};
import { GetRaidDataFromMessage } from "./raidEmbed.js";

export function ClearRaidList(message) {
    if (!config.guilds.map(guild => guild.raids).includes(message.channel.id)) return;

    var raid_channel = message.channel;

    raid_channel.messages.fetch({ limit: 100 }).then(messages => {
        var today = new Date();
        console.log("now:", today);
        messages.sort((a, b) => a.id > b.id ? 1 : -1).forEach(msg => {
            if (msg.pinned) return;
            
            if (!msg.author.bot) {
                console.log("non bot message deleted");
                msg.delete();
                return;
            }

            try{
                var data = GetRaidDataFromMessage(msg);
                console.log(data.date, data.header);
                if (data.date < today) {
                    console.log("raid deleted");
                    msg.delete();
                }
            }catch{
                console.log("bot non raid message deleted");
                msg.delete();
            }

        });
    })
}

export async function AsyncGetPlannedRaids(message, discordMention) {
    var discordId = discordMention.replace(/\D/g, '');

    var raid_channel_id = config.guilds.find(g => g.id == message.guild.id).raids;
    var raid_channel = message.client.channels.cache.get(raid_channel_id);
    var messages = (await raid_channel.messages.fetch({ limit: 50 })).filter(m => m.embeds.length > 0);
    var raids = messages.map(m => GetRaidDataFromMessage(m)).sort((a, b) => a.date - b.date);
    var myraids = raids.filter(r => r?.members?.includes(discordId));
    message.channel.send(myraids.length == 0
        ? 'Вы никуда не записаны.'
        : myraids.map(r => "`" + r.dateString + "` Активность: **" + r.raidName + "**").join('\n'));
}

export function GetRaidAuthorFromMessage(message){
    var data = GetRaidDataFromMessage(message)
    return data.author;
}

