import moment from 'moment-timezone';
const Chart = require('chart.js');
const onClickLegendDefault = Chart.defaults.global.legend.onClick;

class Config {
    constructor(data) {
        this.data = data;
        this.config = {
            type: "line",
            data: {
                labels: [],
                datasets: []
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        gridLines: {
                            lineWidth: [],
                            color: []
                        }
                    }]
                },
                title: {
                    display: true,
                    text: ""
                }
            }
        };
        this.createDatasetObjects = this.createDatasetObjects.bind(this);
        this.changeDatasetProps = this.changeDatasetProps.bind(this);
    }

    createDatasetObjects(num) {
        return new Promise((resolve, reject) => {
            let i;
            for (i=0; i<num; i++) {
                this.config.data.datasets.push({
                    label: "",
                    data: [],
                    fill: false,
                    borderWidth: 3,
                    pointBackgroundColor: "#000",
                    pointRadius : 3,
                    pointHoverBackgroundColor: "#fff",
                });
            }
            resolve();
        });
    }

    changeDatasetProps(setNum, props, removeProps) {
        for (let key in props) {
            if (props.hasOwnProperty(key)) {
                this.config.data.datasets[setNum][key] = props[key];
            }
        }
        if (removeProps) {
            for (let prop in removeProps) {
                delete this.config.data.datasets[setNum][prop];
            }
        }
    }
}

class PrecipConfig extends Config {
    constructor(data) {
        super(data);
        this.todayPrecipRate = this.todayPrecipRate.bind(this);
    }

    todayPrecipRate() {
        let precipRate = [];
        let precipCategory = [];
        let i;
        for (i=0; i<24; i++) {
            const rate = Math.round(this.data.hourly.data[i].precipIntensity * 100)/100;
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

class TempTodayConfig extends Config {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(2).then(() => {
                // Chart Properties
                this.config.options.title.text = "Temperature & Dewpoint";
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

class PrecipTodayConfig extends PrecipConfig {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(4).then(() => {
                // Chart Properties
                this.config.type = "bar"
                this.config.options.title.text = "Precipitation, Cloud Cover, & Relative Humidity";
                this.config.options.tooltips = {
                    callbacks: {
                        label: (t, d) => {
                            const datum = d.datasets[t.datasetIndex].data[t.index]
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

                    this.config.data.datasets[0].data.push(this.data.hourly.data[i].precipProbability * 100);  
                    this.config.data.datasets[1].data.push(this.data.hourly.data[i].cloudCover * 100);
                    this.config.data.datasets[2].data.push(this.data.hourly.data[i].humidity * 100);  
                    // this.config.data.datasets[3].data.push(Math.round(this.data.hourly.data[i].precipIntensity * 100)/100); 
                }
                const rainData = this.todayPrecipRate();
                this.config.data.datasets[3].data = rainData.category;
                resolve(this.config);
            })
        })
    }
}

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

class TempLongConfig extends Config {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(3).then(() => {
                // Chart Plugins
                this.config.plugins = [{
                    afterDraw: (chart, options) => {
                        const metaMin = chart.getDatasetMeta(0);
                        const metaMax = chart.getDatasetMeta(1);
                        chart.ctx.fillStyle = metaMax.data[0]._view.borderColor;
                        let i;
                        for (i=0; i<8; i++) {
                          chart.ctx.fillRect(metaMax.data[i]._view.x - (metaMax.data[i]._view.radius / 2), metaMax.data[i]._view.y, metaMax.data[i]._view.radius, metaMin.data[i]._view.y - metaMax.data[i]._view.y);
                        }
                    }
                }];

                // Chart Properties
                this.config.options.title.text = "Temperature";
                this.config.options.tooltips = {
                    intersect: false,
                    callbacks: {
                        label: (t, d) => {
                            const datum = d.datasets[t.datasetIndex].data[t.index]
                            if (t.datasetIndex < 2) {
                                let adj;
                                if (t.datasetIndex === 0) {
                                    adj = "Min ";
                                } else {
                                    adj = "Max ";
                                }
                                return adj + "Temp: " + datum + String.fromCharCode(176) + "F";
                            } else {
                                return "Dewpoint: " + datum + String.fromCharCode(176) + "F";
                            }

                        }
                    }
                }
                this.config.options.scales.yAxes = [{
                    ticks: {
                        padding: 20
                    }
                }];
                this.config.options.legend = {
                    labels: {
                        filter: (legendItem, chartData) => {
                            if (legendItem.datasetIndex === 0) {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    },
                    onClick: function(e, legendItem) {
                        // Default Legend onClick will work only for dewpoint
                        if (legendItem.datasetIndex === 2) {
                            onClickLegendDefault.call(this, e, legendItem);
                        }
                    }
                }

                // Min Temp Dataset Properties
                this.changeDatasetProps(0, {
                    label: "Min Temperature" +String.fromCharCode(176) + "F",
                    borderColor: "#f00",
                    pointBorderColor: "#f00",
                    pointStyle: "line",
                    pointRadius: 10,
                    pointHoverRadius: 10,
                    pointHoverBorderRadius: 4,
                    pointBorderWidth: 4,
                    showLine: false,
                });

                // Max Temp Dataset Properties
                this.changeDatasetProps(1, {
                    label: "Temperature" +String.fromCharCode(176) + "F",
                    borderColor: "#f00",
                    pointBorderColor: "#f00",
                    pointStyle: "line",
                    pointRadius: 10,
                    pointHoverRadius: 10,
                    pointHoverBorderRadius: 4,
                    pointBorderWidth: 4,
                    showLine: false,
                });

                // Dewpoint Dataset Properties
                this.changeDatasetProps(2, {
                    label: "Dewpoint" +String.fromCharCode(176) + "F",
                    borderColor: "#0f0",
                    pointBorderColor: "#0f0",
                    hidden: true
                });

                let i;
                for (i=0; i<8; i++) {
                    this.config.data.datasets[0].data.push(this.data.daily.data[i].temperatureMin);
                    this.config.data.datasets[1].data.push(this.data.daily.data[i].temperatureMax);
                    this.config.data.datasets[2].data.push(this.data.daily.data[i].dewPoint);
                    this.config.data.labels.push(moment.tz(this.data.daily.data[i].time * 1000, this.data.timezone).format("ddd, M/DD"));
                }
                resolve(this.config);
            })
        })
    }
}

class PrecipLongConfig extends PrecipConfig {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(4).then(() => {
                // Chart Properties
                this.config.type = "bar"
                this.config.options.title.text = "Precipitation, Cloud Cover, & Relative Humidity";
                this.config.options.tooltips = {
                    callbacks: {
                        label: (t, d) => {
                            const datum = d.datasets[t.datasetIndex].data[t.index]
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
                const rainData = this.todayPrecipRate();
                this.config.data.datasets[3].data = rainData.category;
                resolve(this.config);
            })
        })
    }
}

class WindLongConfig extends Config {
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
                for (i=0; i<8; i++) {
                    time = moment.tz(this.data.daily.data[i].time * 1000, this.data.timezone).format("ddd, M/DD");
                    this.config.data.labels.push(time);
                    this.config.data.datasets[0].data.push(Math.round(this.data.daily.data[i].windSpeed));  
                    this.config.data.datasets[1].data.push(Math.round(this.data.daily.data[i].windGust)); 
                }
                resolve(this.config);
            });
        })
    }
}

export {TempTodayConfig, PrecipTodayConfig, WindTodayConfig, TempLongConfig, PrecipLongConfig, WindLongConfig};