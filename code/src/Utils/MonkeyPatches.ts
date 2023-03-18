/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
interface Function {
    readonly name: string;
}

interface String {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    toTitleCase(keep?: boolean): string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    replaceAll(search: string, replacement: string): string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    isFilled(): boolean;
}

interface Array<T> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    randomChoice(): T;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    shuffle(): T;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    equals(array: Array<T>): boolean;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    filter(test: Array<T>): boolean;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    asyncFilter(filterFn: any): Promise<Array<T>>
    // eslint-disable-next-line @typescript-eslint/naming-convention
    asyncFind(filterFn: any): Promise<T>
}

String.prototype.toTitleCase = function (keep?: boolean) {
    if (keep == true) {
        return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase(); });
    }
    return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

String.prototype.replaceAll = function (search: string, replacement: string) {
    return this.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.isFilled = function () {
    return this.length > 0;
};

Array.prototype.randomChoice = function () {
    return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.shuffle = function () {
    let j, x, i;
    for (i = this.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = this[i];
        this[i] = this[j];
        this[j] = x;
    }

    return this;
};

Array.prototype.equals = function (array: Array<any>) {
    if (this === array) {
        return true;
    }

    if (this.length !== array.length) {
        return false;
    }

    for (let i = 0; i < this.length; i++) {
        if (this[i] !== array[i]) {
            return false;
        }
    }

    return true;
};

Array.prototype.asyncFilter = async function (f) {
    const booleans = await Promise.all(this.map(f));
    return this.filter((x, i) => booleans[i]);
};

Array.prototype.asyncFind = async function <T>(asyncCallback: any) {
    const promises = this.map(asyncCallback);
    const results = await Promise.all(promises);
    const index = results.findIndex(result => result);
    return <T>this[index];
};