import { CatchError } from "../core/catcherror.js";
import { RaidData } from "./raidData.js";
import { EmbedBuilder } from "discord.js";
import { GetGlobalMentionForGuild } from "./raidLines.js";

export function CreateRaidMessage(data, customTimestamp) {
    if (data.header.length > 256)
        throw 'Длина заголовка сбора не может быть больше 256 символов.';
    else if (data.header.match(/<@&?\d+>/g)?.length > 0)
        throw 'В заголовке сбора не должно быть упоминаний, используйте описание.';
    else if (data.description != null && data.description.length > 2048)
        throw 'Длина комментария сбора не может быть больше 2048 символов.';
    else if (data.numberOfPlaces == 1)
        throw 'Активность можно собрать не менее, чем на двоих участников.';
    else if (data.numberOfPlaces > 18)
        throw 'Максимальное количество участников — 18.';

    var mention = data.roleTag ? data.roleTag.join(' ') : GetGlobalMentionForGuild(data.guildId);

    var { field0, field1, left } = data.FormFields()
    var embed = new EmbedBuilder()
        .setTitle(data.header)
        .setDescription(data.descriptionField)
        .setColor(0x00AE86)
        .setThumbnail(SelectThumbnail(data.raidName))
        .addFields([
            { name: 'Идут:', value: field0, inline : true },
            { name: '\u200b', value: field1, inline : true },
            //{ name: 'Местное время:', value: data.dateWithTimezone, inline : false },
        ])
        .setFooter({ text: data.footer, iconURL: data.icon })
    if (customTimestamp != null) embed.setTimestamp(customTimestamp);
    if (left.length > 8) embed.addFields([ {name: "Отменили запись:", value: left }] )

    return { content: mention, embeds: [embed], fetchReply: true };
}

function SelectThumbnail(raidName) {
    let raidNameMatcher = string => raidName.toLowerCase().includes(string);
    let activityPredicate = activity => activity.strings.some(raidNameMatcher);
    let thumbnails = activities.filter(activityPredicate).map(activity => activity.image);
    return thumbnails[0] ?? defaultImage;
}

export function GetRaidDataFromMessage(message) {
    CheckMessageIfRaid(message);
    var embed = message.embeds[0];
    var dateString = embed.description.split('\n')[0].split('\u200B')[0].replace(/,.*? в /g, " ").replaceAll("**", "");
    var arr = dateString.split(/[ .:]/g);
    var date = new Date(arr[2], arr[1] - 1, arr[0], arr[3], arr[4]);
    var linesArray = (embed.fields[0].value + "\n" + embed.fields[1].value).replace(/[<@>]/g, '').split('\n');
    var left = embed.fields.length == 2 ? [] :
        embed.fields.find(f => f.name == "Отменили запись:")?.value.split('\n').map(function (line) {
            try {
                var date = new Date(line.match(new RegExp("\`.*?\`"))[0].substring(1, 12));
                var id = line.match(new RegExp("<.*?>"))[0].replace(/\D/g, '');
                var isKicked = line.includes("no_entry_sign");
                return { date: date, id: id, isKicked: isKicked };
            } catch (e) {
                CatchError(e, null, `${message.guildId} \\ ${message.channelId} \\ ${message.id}`);
            }
        }) ?? [];

    return new RaidData(
        embed.title.split('Активность: ')[1],
        embed.description.split('\n').slice(1).join('\n') ?? null,
        date,
        linesArray.length,
        linesArray.filter(line => line != "слот свободен"),
        left,
        {
            displayName: embed.footer.text.split(' | ').slice(0, -1).join(' | ').replace("Собрал: ", ""),
            id: embed.footer.text.split(' | ').slice(-1).join(' | ').replace("id: ", "")
        },
        embed.footer.iconURL,
        message.guild.id,
        message.channel.id,
        message.id
    );
}

function CheckMessageIfRaid(message) {
    if (message.embeds.length == 0)
        throw("Сообщение не распознано как рейд.");

    const regex = new RegExp(/\d{2}.\d{2}.\d{2}.+ в \d{2}:\d{2}/m);
    if(!regex.test(message.embeds[0]?.description))
        throw 'Сообщение не распознано как рейд.';
}

const activities = [
    {   strings: ["пж", "lw", "последн", "желан", "ривен", "сердце", "last", "wish", "виш"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam_LastWish.png" },
    {   strings: ["сгк", "dsc", "склеп", "crypt", "таникс"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam_DeepStoneCrypt.png" },
    {   strings: ["вог", "хч", "vog", "хрустал", "чертог", "атеон", "vault", "glass"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam_icons_vaultofglass.png" },
    {   strings: ["кп", "вод", "vod", "клятв", "послушник", "рулк", "рульк"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam_icons_throneworldraid.png" },
    {   strings: ["гк", "kf", "кф", "гибел", "кинг", "корол", "king", "fall"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/kingsfall.png" },
    {   strings: ["ик", "ron", "источник", "кошмар", "root", "nightmare", "назарек", "бабочка"],
        image:   "https://cdn.discordapp.com/attachments/799584345156616195/1093174841303117944/ron.png" },
    {   strings: ["кк", "ce", "крот", "конец", "crota", "end"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam_icons_CrotasEnd.png" },
    {   strings: ["гс", "se", "грань", "salva", "edge"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteams_salvationsedge.png" },
    {   strings: ["пб", "tdp", "пески", "песок", "конечн", "desert", "perpetual"],
        image:   "https://cdn.discordapp.com/attachments/1047038338344964116/1399063415300952228/Desert_Perpetual.png" },
    {   strings: ["веспер", "vesper", "host"],
        image:   "https://cdn.discordapp.com/attachments/799584345156616195/1296458809681903667/vesper.png" },
    {   strings: ["вера", "отсеченн", "sundered", "doctrine"],
        image:   "https://cdn.discordapp.com/attachments/1047038338344964116/1379988544092901417/sundered-doctrine.png" },
    {   strings: ["трон", "throne"],
        image:   "https://cdn.discordapp.com/attachments/799584345156616195/1207633220527464448/208ce44c0342f8b0691d483d9622bd96.png" },
    {   strings: ["яма", "pit"],
        image:   "https://cdn.discordapp.com/attachments/799584345156616195/1052979841353392148/pit.png" },
    {   strings: ["професи", "откро", "proph"],
        image:   "https://media.discordapp.net/attachments/799584345156616195/1047763762670743563/unknown.png" },
    {   strings: ["тиски", "алчн", "grasp"],
        image:   "https://cdn.discordapp.com/attachments/1047038338344964116/1207635894920814632/5e8be152a38c4acd61b2a9e56671cc83.png" },
    {   strings: ["дуал", "dual"],
        image:   "https://cdn.discordapp.com/attachments/799584345156616195/1207633709285769238/de980f8f4a07662455dd7fa1b3aa2169.png" },
    {   strings: ["шпиль", "хранител", "spire", "watcher"],
        image:   "https://cdn.discordapp.com/attachments/799584345156616195/1207633892853415997/241785dc00e0bf32e30d0031e299cefd.png" },
    {   strings: ["призрак", "глубин", "ghost", "deep"],
        image:   "https://www.bungie.net/common/destiny2_content/icons/be2d0026bddfafd4d4d8ab7b70c2d257.png" },
    {   strings: ["руин", "полк", "warlord", "ruin"],
        image:   "https://cdn.discordapp.com/attachments/799584345156616195/1196386340976197672/warlord_ruin.png" },
    {   strings: ["кон", "вызов", "вечности", "doe", "dares", "eternity"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam30thAnniversary.png" },
    {   strings: ["сс", "gos", "сад", "разум", "garden", "salvation"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam_GardenOfSalvation.png" },
    {   strings: ["кетч"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteamSeason18.png" },
    {   strings: ["экспедиц", "сундук", "воител"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/icon_expeditions.png" },
    {   strings: ["алтари", "altar"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteamAltarsOfSorrow.png" },
    {   strings: ["рыба", "fish"],
        image:   "https://cdn.discordapp.com/attachments/799584345156616195/1152593668067295332/45181123a0ff6595bbf191e208370036.png" },
    {   strings: ["гм", "gm", "грандмастер", "grandmaster"],
        image:   "https://www.bungie.net/common/destiny2_content/icons/DestinyActivityModeDefinition_234e7e18549d5eae2ddb012f2bcb203a.png" },
    {   strings: ["рейд", "raid"],
        image:   "https://images-ext-2.discordapp.net/external/SfRL0Sj2a3O9vtAYpaC2OUG0r0vDipe2h8LeeZnFdf4/https/i.imgur.com/KBiRw8F.png" },
]
const defaultImage = "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteamAnything.png";