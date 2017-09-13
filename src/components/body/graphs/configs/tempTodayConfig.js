import moment from 'moment-timezone';

import Config from './config';

class TempTodayConfig extends Config {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(2).then(() => {
                // Chart Properties
                this.setTitle("Temperature & Dewpoint");
                this.config.options.tooltips = {
                    callbacks: {
                        label: (t, d) => {
                            const datum = d.datasets[t.datasetIndex].data[t.index]
                            if (t.datasetIndex === 0) {
                                return "Temp: " + datum + String.fromCharCode(176) + "F";
                            } else {
                                return "Dewpoint: " + datum + String.fromCharCode(176) + "F";
                            }

                        }
                    }
                } 

                // Temp Dataset Properties
                this.changeDatasetProps(0, {
                    label: "Temperature" +String.fromCharCode(176) + "F",
                    borderColor: "#f00",
                    pointBorderColor: "#f00",
                });

                // Dewpoint Dataset Properties
                this.changeDatasetProps(1, {
                    label: "Dewpoint" +String.fromCharCode(176) + "F",
                    borderColor: "#0f0",
                    pointBorderColor: "#0f0",
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
                    this.config.data.datasets[0].data.push(Math.round(this.data.hourly.data[i].temperature));  
                    this.config.data.datasets[1].data.push(Math.round(this.data.hourly.data[i].dewPoint)); 
                }
                resolve(this.config);    
            });
        });
    }
}
export default TempTodayConfig;