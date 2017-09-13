import Config from './config';

class PrecipConfig extends Config {
    constructor(data) {
        super(data);
        this.precipRateHandler = this.precipRateHandler.bind(this);
    }

    config() {
        this.setTitle("Precipitation, Cloud Cover, & Relative Humidity")
    }

    precipRateHandler(timeIntervals) {
        let precipRate = [];
        let precipCategory = [];
        let i;
        for (i=0; i<timeIntervals; i++) {
            let rate;
            if (timeIntervals === 24) {
                rate = Math.round(this.data.hourly.data[i].precipIntensity * 100)/100;
            } else {
                rate = Math.round(this.data.daily.data[i].precipIntensity * 100)/100;
            }
            precipRate.push(rate);
            if (rate === 0) {
                precipCategory.push("0");
            } else if (rate > 0 && rate <= 0.1) {
                precipCategory.push("1");
            } else if (rate > 0.1 && rate <= 0.3) {
                precipCategory.push("2");
            } else {
                precipCategory.push("3");
            }
        }
        return {rate: precipRate, category: precipCategory};
    }
}
export default PrecipConfig;