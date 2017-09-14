import moment from 'moment-timezone';

import PrecipConfig from './precipConfig';

class PrecipLongConfig extends PrecipConfig {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(4).then(() => {
                // Chart Properties
                this.setTitle("Precipitation, Cloud Cover, & Relative Humidity")
                this.config.type = "bar"
                this.config.options.tooltips = {
                    callbacks: {
                        label: (t, d) => {
                            const datum = d.datasets[t.datasetIndex].data[t.index];
                            if (t.datasetIndex === 3) {
                                if (datum === "0") {
                                    return "No Precip";
                                } else if (datum === "1") {
                                    return "Light Precip";
                                } else if (datum === "2") {
                                    return "Moderate Precip";
                                } else if (datum === "3") {
                                    return "Heavy Precip";
                                } else {
                                    return "N/A";
                                }
                            } else {
                                let name;
                                if (t.datasetIndex === 0) {
                                    name = "Precip Prob: ";
                                } else if (t.datasetIndex === 1) {
                                    name = "Cloud Cover: ";
                                } else if (t.datasetIndex === 2) {
                                    name = "Humidity: ";
                                }                       
                                return name + datum + "%";     
                            }
                        }
                    }
                } 
                //// Setup yAxes
                this.config.options.scales.yAxes = [
                    {
                        id: "percent",
                        position: "left",
                        scaleLabel: {
                            display: true,
                            labelString: "%"
                        },
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            max: 100
                        }
                    },
                    {
                        id: "rate",
                        position: "right",
                        scaleLabel: {
                            display: true,
                            labelString: "Precip Rate",
                        },
                        ticks: {
                            min: 0,
                            max: 3,
                            stepSize: 1,
                            callback: function(value, index, values) {
                                if (value === 0) {
                                    return "None";
                                } else if (value === 1) {
                                    return "Light";
                                } else if (value === 2) {
                                    return "Moderate";
                                } else {
                                    return "Heavy";
                                }
                            }
                        },
                    }
                ]
                
                // Precip Prob Dataset Properties
                this.changeDatasetProps(0, {
                    type: "line",
                    label: "Precip Prob",
                    borderColor: "#66f",
                    pointBorderColor: "#66f",
                    yAxisID: "percent",
                    fill: "rgba(100,100,255,0.2)"
                });

                // Cloud Cover Dataset Properties
                this.changeDatasetProps(1, {
                    type: "line",
                    label: "Cloud Cover",
                    borderColor: "#aaa",
                    pointBorderColor: "#aaa",
                    yAxisID: "percent",
                    fill: "rgba(150,150,150,0.2)",
                    hidden: true                    
                });

                // Humidity Dataset Properties
                this.config.data.datasets[2].type = "line";
                this.config.data.datasets[2].label = "Humidity";
                this.config.data.datasets[2].borderColor = "#909";
                this.config.data.datasets[2].pointBorderColor = "#909";
                this.config.data.datasets[2].yAxisID = "percent";
                this.config.data.datasets[2].hidden = true;

                this.changeDatasetProps(2, {
                    type: "line",
                    label: "Humidity",
                    borderColor: "#909",
                    pointBorderColor: "#909",
                    yAxisID: "percent",
                    hidden: true                    
                });

                // Precip Intensity Dataset Properties
                this.changeDatasetProps(3, {
                    label: "Precip Rate",
                    borderColor: "00f",
                    backgroundColor: "rgba(0,0,255,0.2)",
                    hoverBackgroundColor: "rgba(0,0,255,0.5)",
                    yAxisID: "rate",
                    borderWidth: 2,
                    hidden: true
                }, ["fill", "pointBackgroundColor", "pointRadius", "pointHoverBackgroundColor"]);

                let i;
                let time;
                for (i=0; i<8; i++) {
                    time = moment.tz(this.data.daily.data[i].time * 1000, this.data.timezone).format("ddd, M/DD");
                    this.config.data.labels.push(time);

                    this.config.data.datasets[0].data.push(this.data.daily.data[i].precipProbability * 100);  
                    this.config.data.datasets[1].data.push(this.data.daily.data[i].cloudCover * 100);
                    this.config.data.datasets[2].data.push(this.data.daily.data[i].humidity * 100);  
                    // this.config.data.datasets[3].data.push(Math.round(this.data.hourly.data[i].precipIntensity * 100)/100); 
                }
                const rainData = this.precipRateHandler(8);
                this.config.data.datasets[3].data = rainData.category;
                resolve(this.config);
            })
        })
    }
}
export default PrecipLongConfig;