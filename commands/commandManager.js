import { EmbedBuilder } from "discord.js";
import { GetCreatorCommandsArray } from "./creatorCommand.js";
import { GetMainCommandsArray } from "./mainCommand.js";
import { GetRaidCommandsArray } from "./raidCommand.js";

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
            .setFooter({ text: 'Support: Horodep#2567', iconURL: 'https://cdn.discordapp.com/app-icons/1045276448270852268/af6a59b9de4d21015a67a708e5f85774.png' })
            .setTimestamp()
            .addFields(
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
        Array.prototype.push.apply(this.commandList, GetRaidCommandsArray());
    }
}