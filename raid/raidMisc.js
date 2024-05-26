import config from "../config.json" assert {type: "json"};
import { GetRaidDataFromMessage } from "./raidEmbed.js";
import { raidChannels } from "../raid/contents.js"

export function ClearRaidList(message) {
    if (!raidChannels.includes(message.channel.id)) return;

    var raid_channel = message.channel;

    raid_channel.messages.fetch({ limit: 100 }).then(messages => {
        var today = new Date();
        console.log("now:", today);
        messages.sort((a, b) => a.id > b.id ? 1 : -1).forEach(msg => {
            if (msg.pinned) return;

            if (!msg.author.bot) {
                console.log("non bot message deleted");
                msg.delete().catch(() => null);
                return;
            }

            try{
                if (msg.embeds[0]?.title.startsWith('Запланированные активности:'))
                    return;

                var data = GetRaidDataFromMessage(msg);
                console.log(data.date, data.header);
                if (data.date < today) {
                    console.log("raid deleted");
                    msg.delete().catch(() => null);
                }
            }catch{
                console.log("bot non raid message deleted");
                msg.delete().catch(() => null);
            }

        });
    })
}

export async function AsyncGetPlannedRaids(message, discordMention) {
    var discordId = discordMention.replace(/\D/g, '');

    var raid_channel_ids = config.guilds.find(g => g.id == message.guild.id).raids;
    var raid_channels = raid_channel_ids.map(id => message.client.channels.cache.get(id));
    var messages = await Promise.all(raid_channels.map(async (ch) => {
        return await ch.messages.fetch({ limit: 50 });
    }));
    var messages = messages.map(i => Array.from(i.values())).flat(1)
    var messages = messages.filter(msg => msg.client.user.id == msg.author.id)
    var messages = messages.filter(msg => msg.embeds[0]?.footer?.text.startsWith("Собрал"))
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

