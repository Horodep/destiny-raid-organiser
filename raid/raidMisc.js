import config from "../config.json" assert {type: "json"};
import { GetRaidDataFromEmbed } from "./raidEmbed.js";

export function ClearRaidList(client) {
    var raid_channel = client.channels.cache.get(config.channels.raids);

    raid_channel.messages.fetch({ limit: 50 }).then(messages => {
        var today = new Date();
        console.log("now:", today);
        messages.sort((a, b) => a.id > b.id ? 1 : -1).forEach(message => {
            if (message.pinned) return;
            
            if (!message.author.bot) {
                console.log("non bot message deleted");
                message.delete();
                return;
            }

            var data = GetRaidDataFromEmbed(message.embeds[0]);
            console.log(data.date, data.header);
            if (data.date < today) {
                console.log("raid deleted");
                message.delete();
            }
        });
    })
}

export async function AsyncGetPlannedRaids(message, discordMention) {
    var discordId = discordMention.replace(/\D/g, '');

    var raid_channel = message.client.channels.cache.get(config.channels.raids);
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

