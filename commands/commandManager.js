import { EmbedBuilder } from "discord.js";
import { GetCreatorCommandsArray } from "./creatorCommand.js";
import { GetMainCommandsArray } from "./mainCommand.js";
import { GetRaidCommandsArray } from "./raidCommand.js";
import nodePackage from "../package.json" assert {type: "json"};

export class CommandManager {
    static commandList = [];

    static FindCommand(commandName) {
        var foundCommands = this.commandList.filter(c => c.name === commandName && c.callback != null);
        return foundCommands.length > 0 ? foundCommands[0] : null;
    }

    static GetHelp() {
        var embed = new EmbedBuilder()
            .setAuthor({ name: nodePackage.name })
            .setAuthor({ name: "Список доступных команд :: Destiny Raid Organiser v" + nodePackage.version })
            .setDescription("[Issues tracker](https://github.com/Horodep/destiny-raid-organiser/issues)")
            .setColor(0x00AE86)
            .setThumbnail('https://images-ext-1.discordapp.net/external/veZptUu_KDKmwtUJX5QT3QxESYCaRp4_k0XUwEQxubo/https/i.imgur.com/e9DIB8e.png')
            .setFooter({ text: 'Support: horodep', iconURL: 'https://cdn.discordapp.com/app-icons/1045276448270852268/ece36d47f3a0f2a6e15a82e57e0fbb3b.png' })
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