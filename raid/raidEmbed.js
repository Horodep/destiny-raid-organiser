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
    else if (data.numberOfPlaces > 12)
        throw 'Максимальное количество участников — 12.';

    var mention = data.roleTag ? data.roleTag.join(' ') : GetGlobalMentionForGuild(data.guildId);

    var { field0, field1, left } = data.FormFields()
    var embed = new EmbedBuilder()
        .setAuthor({ name: data.header })
        .setColor(0x00AE86)
        .setThumbnail(SelectThumbnail(data.raidName))
        .addFields([
            { name: 'Идут:', value: field0, inline : true },
            { name: '\u200b', value: field1, inline : true },
            //{ name: 'Местное время:', value: data.dateWithTimezone, inline : false },
        ])
        .setFooter({ text: data.footer, iconURL: data.icon })
    if (customTimestamp != null) embed.setTimestamp(customTimestamp);
    if (data.description != null) embed.setDescription(data.description);
    if (left.length > 8) embed.addFields([ {name: "Отменили запись:", value: left }] )

    return { content: mention, embeds: [embed] };
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
    var dateString = embed.author.name.split(' Активность: ')[0].replace(/,.*? в /g, " ");
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
                CatchError(e);
            }
        }) ?? [];

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
    if(!regex.test(message.embeds[0]?.author?.name))
        throw 'Сообщение не распознано как рейд.';
}

const activities = [
    {   strings: ["пж", "lw", "последн", "желан", "ривен", "сердце", "last", "wish", "ласт", "виш"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam_LastWish.png" },
    {   strings: ["сс", "gos", "сад", "спасен", "разум", "garden", "salvation"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam_GardenOfSalvation.png" },
    {   strings: ["сгк", "dsc", "склеп", "crypt", "таникс"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam_DeepStoneCrypt.png" },
    {   strings: ["вог", "хч", "vog", "хрустал", "чертог", "атеон", "vault", "glass"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam_icons_vaultofglass.png" },
    {   strings: ["кп", "вод", "vod", "клятв", "послушник", "рулк", "рульк"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam_icons_throneworldraid.png" },
    {   strings: ["гк", "kf", "кф", "гибел", "кинг", "корол", "king", "fall"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/kingsfall.png" },
    {   strings: ["трон", "яма", "професи", "тиски", "алчн", "откро", "дуал", "proph", "pit", "throne", "grasp", "dual"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteamDungeon.png" },
    {   strings: ["кон", "вызов", "вечности", "doe", "dares", "eternity"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteam30thAnniversary.png" },
    {   strings: ["кетч"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteamSeason18.png" },
    {   strings: ["экспедиц", "сундук", "воител"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/icon_expeditions.png" },
    {   strings: ["алтари", "altar"],
        image:   "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteamAltarsOfSorrow.png" },
    {   strings: ["гм", "gm", "грандмастер", "grandmaster"],
        image:   "https://www.bungie.net/common/destiny2_content/icons/DestinyActivityModeDefinition_234e7e18549d5eae2ddb012f2bcb203a.png" },
    {   strings: ["рейд", "raid"],
        image:   "https://images-ext-2.discordapp.net/external/SfRL0Sj2a3O9vtAYpaC2OUG0r0vDipe2h8LeeZnFdf4/https/i.imgur.com/KBiRw8F.png" },
]
const defaultImage = "https://www.bungie.net/img/theme/destiny/icons/fireteams/fireteamAnything.png";