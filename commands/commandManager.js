import { EmbedBuilder } from "discord.js";
import { GetCreatorCommandsArray } from "./creatorCommand.js";
import { GetMainCommandsArray } from "./mainCommand.js";

export class CommandManager {
    static commandList = [];

    static FindCommand(commandName) {
        var foundCommands = this.commandList.filter(c => c.name === commandName && c.callback != null);
        return foundCommands.length > 0 ? foundCommands[0] : null;
    }

    static GetHelp() {
        var embed = new EmbedBuilder()
            .setAuthor({ name: "Список доступных команд" })
            .setDescription("[Issues tracker](https://github.com/Horodep/destiny-raid-organiser/issues)")
            .setColor(0x00AE86)
            .setThumbnail('https://images-ext-1.discordapp.net/external/veZptUu_KDKmwtUJX5QT3QxESYCaRp4_k0XUwEQxubo/https/i.imgur.com/e9DIB8e.png')
            .setFooter({ text: 'Horobot', iconURL: 'https://cdn.discordapp.com/avatars/564870880853753857/127385781e26e7dcfdbe312de1843ddf.png' })
            .setTimestamp()
            embed.addFields(
                this.commandList
                    .filter(c => (c.status < 1 && c.description != ''))
                    .sort((a, b) => a.name > b.name ? 1 : -1)
                    .map((command) => ({ name: command.usage, value: command.description }))

            )
        return { embeds: [embed] };
    }

    static Init() {
        Array.prototype.push.apply(this.commandList, GetCreatorCommandsArray());
        Array.prototype.push.apply(this.commandList, GetMainCommandsArray());
    }
}