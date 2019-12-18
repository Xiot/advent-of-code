const {defer} = require('./deferred');

export class Stream {
    constructor(data) {
        this.data = data ? [...data] : [];
        this._hold = undefined;
        this._writeHandlers = [];
    }

    on(event, callback) {
        if (event === 'write') {
            this._writeHandlers.push(callback);
            return () => this._writeHandlers = this._writeHandlers.filter(x => x!== callback);
        }
        return () => {};
    }

    async read() {
        if (this.data.length > 0) {
            return Promise.resolve(this.data.shift());
        } else {
            this._hold = defer();
            return this._hold.promise;
        }
    }

    async write(value) {
        if (this._hold) {
            this._hold.resolve(value);
            this._hold = undefined;
        } else {
            this.data.push(value);
        }
        this._writeHandlers.forEach(cb => {
            cb(value);
        });
    }

    [Symbol.asyncIterator] = async function*() {
        while(true) {
            yield await this.read();
        }
    }
}
