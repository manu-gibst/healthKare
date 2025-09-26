const GRAVITY = 9.80665;
const threshold = 0.0185 * GRAVITY;

class Sleep {
    constructor(samples) {
        this.samples = samples;
        this._lowActivityMinutes = null;
        this._highActivityMinutes = null;
    }

    printSamples() {
        console.log("From sleep.js");
        console.log(this.samples);
    }

    getDuration() {
        const first = this.samples[0].timestamp;
        const last = this.samples.at(-1).timestamp;
        const diffMins = Math.floor((last - first) / 1000 / 60);
        const diffHours = Math.floor((last - first) / 1000 / 60 / 60);
        return `${diffHours.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}`;
    }

    getEfficiency() {
        return (this._getLowActivityMinutes() / this._getTotalMinutes()) * 100;
    }

    getQuality() {
        const highActivityRate = (this._getHighActivityMinutes() / this._getTotalMinutes());
        if (highActivityRate < 0.1) return "High";
        if (highActivityRate < 0.2) return "Medium";
        return "Low";
    }

    _computeLowHighActivityMinutes() {
        this._lowActivityMinutes = this._lowActivityMinutes || 0;
        this._highActivityMinutes = this._highActivityMinutes || 0;
        for (let sample of this.samples) {
            if (sample.rms > threshold) this._highActivityMinutes++;
            else this._lowActivityMinutes++;
        }
    }

    _getLowActivityMinutes() {
        if (this._lowActivityMinutes === null) this._computeLowHighActivityMinutes();
        return this._lowActivityMinutes;

    }
    _getHighActivityMinutes() {
        if (this._highActivityMinutes !== null) this._computeLowHighActivityMinutes();
        return this._highActivityMinutes;
    }

    _getTotalMinutes() {
        return this.samples.length;
    }
}

module.exports = { Sleep };