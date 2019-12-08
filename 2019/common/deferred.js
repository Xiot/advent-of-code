
const deferConstructor = () => new InternalDeferred();

const resolved = (value) => {
    const d = new InternalDeferred();
    d.resolve(value);
    return d;
};

const rejected = (ex) => {
    const d = new InternalDeferred();
    d.reject(ex);
    return d;
};

const defer = Object.assign(deferConstructor, {
    resolved,
    rejected,
});

class InternalDeferred {

    constructor() {
        this._settled = false;
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    resolve(value) {
        if (this._settled) {
            throw new Error('The Promise is already settled.');
        }
        this._value = value;
        this._settled = true;
        this._resolve(value);
    }

    reject(ex) {
        if (this._settled) {
            throw new Error('The Promise is already settled.');
        }
        this._error = ex;
        this._settled = true;
        this._reject(ex);
    }

    get promise() {
        return this._promise;
    }

    get isSettled() {
        return this._settled;
    }

    get hasValue() {
        return !!(this._settled && this._value);
    }
    get hasError() {
        return !!(this._settled && this._error);
    }

    get value() {
        return this._value;
    }
    get error() {
        return this._error;
    }
}

module.exports = {
    defer
};