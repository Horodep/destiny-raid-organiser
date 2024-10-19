import { RaidData, GetDateString } from "./raidData.js";
import config from "../config.json" assert {type: "json"};

export function ParseMessageCommandAndGetRaidData(args, message) {
    //0    1     2     3   4           5
    //сбор 22.09 18:00 [3] {@tag @tag} кс, рандомный комент
    if (args.length < 4) throw 'Указано недостаточно данных.';

    var member = message.member;

    var date = ParseCommandAndGetDate(args);

    var commandRaidInfo = args.filter((_, i) => i > 2).join(" ");
    
    var raidNameArr = commandRaidInfo.match(/(\[\d{1,2}\])? ?((.|\n)+)/);
    if (raidNameArr == null) throw 'Активность не определена.';
    if (raidNameArr.length < 2) throw 'Активность не определена.';
    var raidInfo = raidNameArr[raidNameArr.length - 2];
    var raidName = raidInfo.indexOf(',') == -1 ? raidInfo : raidInfo.substr(0, raidInfo.indexOf(','));
    if (raidName == '') throw 'Активность не определена.';

    var description = (raidInfo.indexOf(',') == -1 ? "" : raidInfo.substr(raidInfo.indexOf(',') + 1));
    if (description != ""){
        message.mentions.users.forEach(mention => {
            description = description.replaceAll(mention, "");
        });
        description = description.replaceAll(/\s{2,}/g, ' ');
    }

    var numberOfPlaces = commandRaidInfo.match(/^\[\d+\]/);
    var numberOfPlaces = (numberOfPlaces == null) ? 6 : numberOfPlaces[0].match(/\d+/)[0];

    return new RaidData(
        raidName, 
        description, 
        date, 
        numberOfPlaces, 
        [], [], 
        member, 
        member.user.avatarURL(), 
        message.guild.id, 
        message.channel.id, 
        null);
}

export function ParseSlashCommandAndGetRaidData(interaction, numberOfPlaces) {
    var member = interaction.member;

    var today = new Date();
    var day = "";
    switch (interaction.options.getString('date')){
        case "сегодня":
            day =  today.getDate() + "." + (today.getMonth()+1);
            break;
        case "завтра":
            today.setDate(today.getDate() + 1);
            day =  today.getDate() + "." + (today.getMonth()+1);
            break;
        case "послезавтра":
            today.setDate(today.getDate() + 2);
            day =  today.getDate() + "." + (today.getMonth()+1);
            break;
        default:
            day = interaction.options.getString('date');
            break;
    }

    var time = interaction.options.getString('time');
    var name = interaction.options.getString('name');
    var description = (interaction.options.getString('description') ?? "").replaceAll(/<@\d+>/g, "");
    var date = ParseCommandAndGetDate(["_", day, time]);

    return new RaidData(
        name, 
        description, 
        date, 
        numberOfPlaces, 
        [], [], 
        member, 
        member.user.avatarURL(), 
        interaction.guild.id,
        interaction.channel.id,
        null);
}

export function ParseCommandAndGetDate(args) {
    if (args.length < 3) throw 'Указано недостаточно данных.';

    var today = new Date();
    var date = new Date(today.getFullYear(), args[1].split('.')[1] - 1, args[1].split('.')[0], args[2].split(':')[0], args[2].split(':')[1]);
    if (date < today) date.setFullYear(today.getFullYear() + 1);
    if (isNaN(date) || typeof (date) == 'underfined') throw 'Не удалось обнаружить дату.';

    return date;
}

export function FormRaidInfoPrivateMessage(data, message, oldData) {
    var line = `${message}
> Активность: **${data.raidFullName.replace('\n', '**\n> **')}**
> Дата проведения: **${data.dateString}**
> Автор сбора: **${data.author.displayName}**`;
    switch (typeof (oldData)){
        case 'object':
            line += `\nСтарая дата проведения: ${GetDateString(oldData)}`
            break;
        case 'string':
            line += `\nСтарое описание активности: ${oldData}`
            break;
    }
    return line;
}

export async function FormFullRaidInfoPrivateMessage(data, guild) {
    var line = FormRaidInfoPrivateMessage(data, "Информация о рейде:");
    line += `\n> Участники: `;
    for (var i=0; i<data.members.length; i++)
    {
        if (data.members[i] != "слот свободен"){
            var discordMember = await guild.members.fetch(data.members[i]);

            if (discordMember)
                line += `\n> • <@${data.members[i]}> (${discordMember.displayName})`;
            else
                line += `\n> • пользователь не найден`;
        }       
    }
    return line;
}

export function GetGlobalMentionForGuild(guildId){
    var mentions = config.guilds.find(g => g.id == guildId).mentions;
    if (mentions)
        return mentions.map(mention => "<@&" + mention + ">").join(' ');
    else
        return "@here";
}