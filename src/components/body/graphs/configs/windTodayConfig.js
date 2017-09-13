import moment from 'moment-timezone';

import Config from './config';

class WindTodayConfig extends Config {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(2).then(() => {
                // Chart Properties
                this.config.options.title.text = "Wind";
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

                let i;
                let time;
                for (i=0; i<24; i++) {
                    time = moment.tz(this.data.hourly.data[i].time * 1000, this.data.timezone).format("h:mma");
                    this.config.data.labels.push(time);
                    if (time === "12:00am") {
                        this.config.options.scales.xAxes[0].gridLines.lineWidth.push(1);
                        this.config.options.scales.xAxes[0].gridLines.color.push("rgba(0,0,0,0.5");
                    } else {
                        this.config.options.scales.xAxes[0].gridLines.lineWidth.push(1);
                        this.config.options.scales.xAxes[0].gridLines.color.push("rgba(0,0,0,0.1)");
                    }
                    this.config.data.datasets[0].data.push(Math.round(this.data.hourly.data[i].windSpeed));  
                    this.config.data.datasets[1].data.push(Math.round(this.data.hourly.data[i].windGust)); 
                }
                resolve(this.config);
            });
        })
    }
}
export default WindTodayConfig;