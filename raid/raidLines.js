import { RaidData } from "./raidData.js";
import config from "../config.json" assert {type: "json"};

export function ParseCommandAndGetRaidData(args, member) {
    //0    1     2     3   4 
    //сбор 22.09 18:00 [3] кс, рандомный комент
    if (args.length < 4) throw 'Указано недостаточно данных.';

    var date = ParseCommandAndGetDate(args);

    var commandRaidInfo = args.filter((_, i) => i > 2).join(" ");
    var raidName = commandRaidInfo.indexOf(',') == -1 ? commandRaidInfo : commandRaidInfo.substr(0, commandRaidInfo.indexOf(','));
    if (raidName == '') throw 'Активность не определена.';

    var description = (commandRaidInfo.indexOf(',') == -1 ? null : commandRaidInfo.substr(commandRaidInfo.indexOf(',') + 1));

    var numberOfPlaces = commandRaidInfo.match(/^\[\d+\]/);
    if (numberOfPlaces != null) raidName = raidName.replace(numberOfPlaces[0], "").trim();
    var numberOfPlaces = (numberOfPlaces == null) ? 6 : numberOfPlaces[0].match(/\d+/);

    return new RaidData(raidName, description, date, numberOfPlaces, [], [], member, member.user.avatarURL(), member.guild.id);
}

export function ParseCommandAndGetDate(args) {
    if (args.length < 3) throw 'Указано недостаточно данных.';

    var today = new Date();
    var date = new Date(today.getFullYear(), args[1].split('.')[1] - 1, args[1].split('.')[0], args[2].split(':')[0], args[2].split(':')[1]);
    if (date < today) date.setFullYear(today.getFullYear() + 1);
    if (isNaN(date) || typeof (date) == 'underfined') throw 'Не удалось обнаружить дату.';

    return date;
}

export function FormRaidInfoPrivateMessage(data, message) {
    return `${message}
> Активность: **${data.raidName}**
> Дата проведения: **${data.dateString}**
> Автор сбора: **${data.author.displayName}**`;
}

export function GetGlobalMentionForGuild(guildId){
    return guildId ? "<@&" + config.guilds.find(g => g.id == guildId).mention + ">" : "";
}