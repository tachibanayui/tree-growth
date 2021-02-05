import EventEmiter from 'events';

export default class ConsoleEmitter extends EventEmiter {
    constructor(keybinds, defaultAction) {
        super();
        this.keybinds = keybinds;
        this.defaultAction = defaultAction;

        var stdin = process.stdin;
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf-8");
        stdin.on('data', (key) => this.handleData(key));
    }

    handleData(key) {
        if(key === '\u0003') {
            this.emit('exit');
            process.exit();
        }
        else {
            console.clear();
            var act = this.keybinds.find(x => x.key === key);
            if(act) {
                this.emit('action', act.action);
            } else {
                this.emit('action', this.defaultAction);
            }
        }
    }
}