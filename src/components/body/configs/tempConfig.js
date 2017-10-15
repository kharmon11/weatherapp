import moment from 'moment-timezone';
import Config from './config';

class TempConfig extends Config {
    constructor(data) {
        super(data);
        this.configureChart = this.configureChart.bind(this);
        this.tempHandler = this.tempHandler.bind(this);
    }

    configureChart() {
        this.setTitle("Temperature & Dewpoint");
    }

    tempHandler(timeIntervals) {
        let i;
        let time;
        const timeFormat = timeIntervals === 24 ? "h:mma": "MMM DD";
        const timeType = timeIntervals === 24 ? "hourly": "daily";
        for (i=0; i<timeIntervals; i++) {
            time = moment.tz(this.data[timeType].data[i].time * 1000, this.data.timezone).format(timeFormat);
            this.config.data.labels.push(time);
            if (timeIntervals === 24) {
                this.midnightLineMark(time);
                this.config.data.datasets[0].data.push(Math.round(this.data.hourly.data[i].temperature));
                this.config.data.datasets[1].data.push(Math.round(this.data.hourly.data[i].dewPoint)); 
            } else {
                this.config.data.datasets[0].data.push(this.data.daily.data[i].temperatureMin);
                this.config.data.datasets[1].data.push(this.data.daily.data[i].temperatureMax);
                this.config.data.datasets[2].data.push(Math.round(this.data.hourly.data[i].dewPoint));
            }
        }
    }
}
export default TempConfig;