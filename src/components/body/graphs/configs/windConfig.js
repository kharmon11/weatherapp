import moment from 'moment-timezone';
import Config from './config';

class WindConfig extends Config {
    constructor(data) {
        super(data);
        this.configureChart = this.configureChart.bind(this);
        this.windDataHandler = this.windDataHandler.bind(this);
    }

    configureChart() {
        this.setTitle("Wind");
        this.config.options.tooltips = {
            callbacks: {
                label: (t, d) => {
                    const datum = d.datasets[t.datasetIndex].data[t.index]
                    if (t.datasetIndex === 0) {
                        return "Wind Speed: " + datum + "mph";
                    } else {
                        return "Wind Gust: " + datum + "mph";
                    }

                }
            }
        }
         // Wind Speed Dataset Properties
         this.changeDatasetProps(0, {
            label: "Wind Speed (mph)",
            borderColor: "#79f",
            pointBorderColor: "#79f"
        });

        // Wind Gust Dataset Properties
        this.changeDatasetProps(1, {
            label: "Wind Gust (mph)",
            borderColor: "rgba(0,0,200,0.5)",
            pointBorderColor: "rgba(0,0,200,0.5)",
            hidden: true
        });
    }

    windDataHandler(timeIntervals) {
        let i;
        let time;
        for (i=0; i<timeIntervals; i++) {
            time = moment.tz(this.data.hourly.data[i].time * 1000, this.data.timezone).format("h:mma");
            this.config.data.labels.push(time);
            if (timeIntervals === 24) {
                this.midnightLineMark(time);
            }
            this.config.data.datasets[0].data.push(Math.round(this.data.hourly.data[i].windSpeed));  
            this.config.data.datasets[1].data.push(Math.round(this.data.hourly.data[i].windGust)); 
        }
    }
}
export default WindConfig;