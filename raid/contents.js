import config from "../config.json" assert {type: "json"};
import { client } from "../index.js";
import { EmbedBuilder } from "discord.js";
import { GetShortDateWithWeekday } from "../raid/raidData.js";

export const raidChannels = config.guilds.map(guild => guild.raids).flat(1);
export const raidDataArray = {};

export const contentChannels = config.guilds.map(guild => guild.contents).flat(1).filter(i => i != undefined);

export function GenerateContents () {

    for (var channelId of contentChannels) {
        if (raidChannels.includes(channelId))
            CheckAndUpdateContentMessage(channelId);
	}
}

export async function CheckAndUpdateContentMessage(channelId) {
    if (!contentChannels.includes(channelId))
        return;

    var channel = await client.channels.cache.get(channelId);

    if(channel == undefined)
        return;

    var msg = await FindContentMessageInChannel(channel);

    if (raidDataArray[channelId].length == 0){
        msg?.delete().catch(() => null);
        return;
    }

    var embed = CreateContentMessage(channelId);

    if (msg != null){
        var isLast = await CheckIfMessageIsLast(channel, msg.id);
        
        if (!isLast){
            msg?.delete().catch(() => null);
            channel.send(embed);
        }
        else
        {
            msg.edit(embed);
        }
    }
    else
    {
        channel.send(embed);
    }
}

async function CheckIfMessageIsLast(channel, messageId) {
    var messages = await channel?.messages.fetch({ limit: 100 });
    messages.sort((a, b) => a.id > b.id ? -1 : 1);
    return messages.entries().next().value[0] == messageId;
}

function CreateContentMessage(channelId) {
    var description = '\u200b';
    var today = new Date();

    var guildId = raidDataArray[channelId][0].guildId;
    var regex = config.guilds.filter(i => i.id == guildId)[0].roleRegexp;

    raidDataArray[channelId].sort((a, b) => a.date > b.date ? 1 : -1);

    for (var data of raidDataArray[channelId]){
        if (data.date < today) continue;

        var counter = data.description == "" ? 40 : 34;
        var title = data.raidName.length > counter ?
            data.raidName.slice(0, counter) + "..." : data.raidName;

        description += "`" + GetShortDateWithWeekday(data.date) + "`";
        description += " `+" + (data.numberOfPlaces - data.members.length) + "` ";
        description += `[**${title}** ${data.description == "" ? "" : "(info)"}]`;
        description += `(${data.messageUrl} "${data.raidName}${data.description == "" ? "" : ","}${data.descriptionWithoutTags}")`;

        if (data.roleTag){
            var roleId = data.roleTag.join(' ').match(/\d+/g);
            var emoji = regex == undefined ? undefined : regex[roleId];
            description += " " + ((emoji != undefined) ? emoji : ":question:");
        }

        description += "\n";
    }

    var embed = new EmbedBuilder()
        .setTitle("Запланированные активности:")
        .setDescription(description)
        .setColor(0x00AE86);

    return { content: "", embeds: [embed], fetchReply: true };
}

async function FindContentMessageInChannel(channel) {
    var messages = await channel?.messages.fetch({ limit: 100 });
    
    for (var kvp of messages) {
        var msg = kvp[1];
        if (msg.client.user.id != msg.author.id) continue;
        if (msg.embeds[0]?.title.startsWith('Запланированные активности:'))
            return msg;
    }
        
    return null;
}

export function FindAndUpdateRaidData(data){
    var raid = raidDataArray[data.channelId].find(i => i.messageId == data.messageId);
    var index = raidDataArray[data.channelId].indexOf(raid);
    raidDataArray[data.channelId][index] = data;

    CheckAndUpdateContentMessage(data.channelId);
}

export function FindAndDeleteRaidData(data){
    var raid = raidDataArray[data.channelId].find(i => i.messageId == data.messageId);
    var index = raidDataArray[data.channelId].indexOf(raid);
    if (index > -1)
        raidDataArray[data.channelId].splice(index, 1);

    CheckAndUpdateContentMessage(data.channelId);
}

export function FindAndDeleteRaidDataByMessageId(channelId, messageId){
    var raid = raidDataArray[channelId].find(i => i.messageId == messageId);
    var index = raidDataArray[channelId].indexOf(raid);
    if (index > -1)
        raidDataArray[channelId].splice(index, 1);

    CheckAndUpdateContentMessage(channelId);
}