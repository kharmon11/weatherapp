import moment from 'moment-timezone';
import Config from './config';

class PrecipConfig extends Config {
    constructor(data) {
        super(data);
        this.configureChart = this.configureChart.bind(this);
        this.nonPrecipRateHandler = this.nonPrecipRateHandler.bind(this);
        this.precipRateHandler = this.precipRateHandler.bind(this);
    }

    configureChart() {
        // Chart Config
        this.setTitle("Precipitation, Cloud Cover, & Relative Humidity");
        this.config.type = "bar";
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
                    minRotation: 300,
                    maxRotation: 300,
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
    }

    nonPrecipRateHandler(timeIntervals) {
        let i;
        let time;
        const timeFormat = timeIntervals === 24 ? "h:mma": "MMM DD";
        const timeType = timeIntervals === 24 ? "hourly": "daily";
        for (i=0; i<timeIntervals; i++) {
            time = moment.tz(this.data[timeType].data[i].time * 1000, this.data.timezone).format(timeFormat);
            this.config.data.labels.push(time);

            if (time === "12:00am") {
                this.config.options.scales.xAxes[0].gridLines.lineWidth.push(1);
                this.config.options.scales.xAxes[0].gridLines.color.push("rgba(0,0,0,0.5");
            } else {
                this.config.options.scales.xAxes[0].gridLines.lineWidth.push(1);
                this.config.options.scales.xAxes[0].gridLines.color.push("rgba(0,0,0,0.1)");
            }

            this.config.data.datasets[0].data.push(this.data[timeType].data[i].precipProbability * 100);  
            this.config.data.datasets[1].data.push(this.data[timeType].data[i].cloudCover * 100);
            this.config.data.datasets[2].data.push(this.data[timeType].data[i].humidity * 100);  
        }
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