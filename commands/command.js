import { CatchError } from "../core/catcherror.js";

export class Command {
    constructor(usage, status, apiDependency, description, callback) {
        this.usage = usage;
        this.status = status;
        this.apiDependency = apiDependency;
        this.description = description;
        this.callback = callback;
    }

    Run(args, message) {
        this.SaveRun(args, message);
    }

    async SaveRun(args, message) {
        try {
            if (this.status > 1) throw ("Команда отключена");
            else await this.callback(args, message);
        } catch (e) {
            CatchError(e, message.channel);
        }
    }

    get name() {
        return this.usage.split(' ')[0];
    }
}