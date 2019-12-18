const readline = require('readline');
export function prompt(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

export function waitForKey() {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    return new Promise(resolve => {
        const listener = (str, key) => {
            process.stdin.off('keypress', listener);
            if (key.ctrl && key.name === 'c') {
                process.exit();
            }
            resolve(key);
        };
        process.stdin.on('keypress', listener);

    });
}