export class RaidData {
    raidName;
    description;
    roleTag;
    date;
    numberOfPlaces;
    members = [];
    left = [];
    author; // .displayName , .id , .user.avatarURL

    constructor(raidName, description, roleTag, date, numberOfPlaces, members, left, author, avatarURL) {
        this.raidName = raidName;
        this.description = description;
        this.roleTag = roleTag;
        this.date = date;
        this.numberOfPlaces = numberOfPlaces;
        this.members = members;
        this.left = left;
        this.author = author;
        this.author.avatarURL = avatarURL;
    }

    get dateString() {
        return "" + 
            (this.date.getDate() < 10 ? "0" : "") + this.date.getDate() + "." +
            (this.date.getMonth() < 9 ? "0" : "") + (this.date.getMonth() + 1) + "." +
            this.date.getFullYear() + ", " + weekdayTranslaytor(this.date.getDay()) + " в " +
            (this.date.getHours() < 10 ? "0" : "") + this.date.getHours() + ":" +
            (this.date.getMinutes() < 10 ? "0" : "") + this.date.getMinutes();
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

    FormFields() {
        var prefilter = this.AddSlotsToMembers().map(m => (m.charAt(0) == 'с' ? m : "<@" + m + ">"));
        var field0 = prefilter.filter((_, i) => i < this.numberOfPlaces / 2).join("\n");
        var field1 = prefilter.filter((_, i) => i >= this.numberOfPlaces / 2).join("\n");
        var left = this.left.map(m => "`" + GetShortDate(m.date) + "` <@" + m.id + ">").join("\n");
        return { field0, field1, left };
    }

    AddSlotsToMembers() {
        var arr = this.members;
        while (arr.length < this.numberOfPlaces) arr.push("слот свободен");
        return arr;
    }

    AddRaidMember(userId) {
        if (this.members.includes(userId))
            return;
        if (this.members.length < this.numberOfPlaces)
            this.members.push(userId);
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

    AddToLeftField(userId) {
        var index = this.left.findIndex(m => m.id == userId);
        if (index == -1) {
            this.left.push({
                date: new Date(),
                id: userId
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