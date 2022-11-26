import { CatchError } from "../core/catcherror.js";
import { RaidData } from "./raidData.js";
import { EmbedBuilder } from "discord.js";
import { GetGlobalMentionForGuild } from "./raidLines.js";

export function CreateRaidMessage(data, customTimestamp) {
    if (data.header.length > 256)
        throw 'Длина заголовка сбора не может быть больше 256 символов.';
    else if (data.description != null && data.description.length > 2048)
        throw 'Длина комментария сбора не может быть больше 2048 символов.';
    else if (data.numberOfPlaces == 1)
        throw 'Активность можно собрать не менее, чем на двоих участников.';

    var mention = data.roleTag ? data.roleTag.join(' ') : GetGlobalMentionForGuild(data.guildId);

    var { field0, field1, left } = data.FormFields()
    var embed = new EmbedBuilder()
        .setAuthor({ name: data.header })
        .setColor(0x00AE86)
        .setThumbnail('https://images-ext-2.discordapp.net/external/SfRL0Sj2a3O9vtAYpaC2OUG0r0vDipe2h8LeeZnFdf4/https/i.imgur.com/KBiRw8F.png')
        .addFields([
            { name: 'Идут:', value: field0, inline : true },
            { name: 'Идут:', value: field1, inline : true },
        ])
        .setFooter({ text: data.footer, iconURL: data.icon })
    if (customTimestamp != null) embed.setTimestamp(customTimestamp);
    if (data.description != null) embed.setDescription(data.description);
    if (left.length > 8) embed.addFields([ {name: "Отменили запись:", value: left }] )

    return { content: mention, embeds: [embed] };
}

export function GetRaidDataFromMessage(message) {
    CheckMessageIfRaid(message);
    var embed = message.embeds[0];
    var dateString = embed.author.name.split(' Активность: ')[0].replace(/,.*? в /g, " ");
    var arr = dateString.split(/[ .:]/g);
    var date = new Date(arr[2], arr[1] - 1, arr[0], arr[3], arr[4]);
    var linesArray = (embed.fields[0].value + "\n" + embed.fields[1].value).replace(/[<@>]/g, '').split('\n');
    var left = embed.fields.length == 2 ? [] :
        embed.fields[2].value.split('\n').map(function (line) {
            try {
                var date = new Date(line.match(new RegExp("\`.*?\`"))[0].substring(1, 12));
                var id = line.match(new RegExp("<.*?>"))[0].replace(/\D/g, '');
                return { date: date, id: id };
            } catch (e) {
                CatchError(e);
            }
        });

    return new RaidData(
        embed.author.name.split(' Активность: ')[1],
        embed.description,
        date,
        linesArray.length,
        linesArray.filter(line => line != "слот свободен"),
        left,
        {
            displayName: embed.footer.text.split(' | ')[0].replace("Собрал: ", ""),
            id: embed.footer.text.split(' | ')[1].replace("id: ", "")
        },
        embed.footer.iconURL,
        message.guild.id
    );
}

function CheckMessageIfRaid(message) {
    if (message.embeds.length == 0)
        throw("Сообщение не распознано как рейд.");

    const regex = new RegExp(/\d{2}.\d{2}.\d{2}.+ в \d{2}:\d{2} .+: .+/m);
    if(!regex.test(message.embeds[0].author.name))
        throw 'Сообщение не распознано как рейд.';
}