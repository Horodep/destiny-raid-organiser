export class RaidData {
    raidName;
    description;
    date;
    numberOfPlaces;
    members = [];
    left = [];
    author; // .displayName , .id , .user.avatarURL
    guildId;

    constructor(raidName, description, date, numberOfPlaces, members, left, author, avatarURL, guildId) {
        this.raidName = raidName;
        this.description = description;
        this.date = date;
        this.numberOfPlaces = numberOfPlaces;
        this.members = members;
        this.left = left;
        this.author = author;
        this.author.avatarURL = avatarURL;
        this.guildId = guildId;
    }

    get dateString() {
        return GetDateString(this.date);
    }

    get raidFullName() {
        return this.raidName + (this.description ? ", " + this.description : ""); 
    }

    get header() {
        return this.dateString + " Активность: " + this.raidName;
    }

    get footer() {
        return "Собрал: " + this.author.displayName + " | id: " + this.author.id;
    }

    get icon() {
        return this.author?.avatarURL;
    }

    get roleTag() {
        var regexpRoleTag = /<@.\d+>/g;
        return (this.description == null ? null : this.description.match(regexpRoleTag));
    }

    get dateWithTimezone() {
        return "<t:" + this.date.getTime()/1000 + ">";
    }

    FormFields() {
        var prefilter = this.AddSlotsToMembers().map(m => (m.charAt(0) == 'с' ? m : "<@" + m + ">"));
        var field0 = prefilter.filter((_, i) => i < this.numberOfPlaces / 2).join("\n");
        var field1 = prefilter.filter((_, i) => i >= this.numberOfPlaces / 2).join("\n");
        var left = this.left.map(m => "`" + GetShortDate(m.date) + "`" + (m.isKicked ? " :no_entry_sign:" : "") + " <@" + m.id + ">").join("\n");
        return { field0, field1, left };
    }

    AddSlotsToMembers() {
        var arr = this.members;
        while (arr.length < this.numberOfPlaces) arr.push("слот свободен");
        return arr;
    }

    AddRaidMember(userId) {
        if (this.members.includes(userId))
            return false;
        if (this.members.length < this.numberOfPlaces){
            this.members.push(userId);
            return true;
        }
        return false;
    }

    RemoveRaidMember(userId) {
        var index = this.members.indexOf(userId);
        if (index > -1) {
            this.members.splice(index, 1);
        }
    }

    RemoveFromLeftField(userId) {
        var index = this.left.findIndex(m => m.id == userId);
        if (index > -1) {
            this.left.splice(index, 1);
        }
    }

    AddToLeftField(userId, isKicked) {
        var index = this.left.findIndex(m => m.id == userId);
        if (index == -1) {
            this.left.push({
                date: new Date(),
                id: userId,
                isKicked: isKicked ?? false
            });
        }
    }

    GetUserIdByPosition(position) {
        return this.members[position - 1];
    }
}

function weekdayTranslaytor(num) {
    switch (num) {
        case 0: return "воскресенье";
        case 1: return "понедельник";
        case 2: return "вторник";
        case 3: return "среда";
        case 4: return "четверг";
        case 5: return "пятница";
        case 6: return "суббота";
    }
}

function GetShortDate(date) {
    return "" +
        (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "-" +
        (date.getDate() < 10 ? "0" : "") + date.getDate() + " " +
        (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
        (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
}

export function GetDateString(date) {
    return "" + 
        (date.getDate() < 10 ? "0" : "") + date.getDate() + "." +
        (date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1) + "." +
        date.getFullYear() + ", " + weekdayTranslaytor(date.getDay()) + " в " +
        (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" +
        (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
}