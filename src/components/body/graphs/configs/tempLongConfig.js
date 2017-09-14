import TempConfig from './tempConfig';

const onClickLegendDefault = require('chart.js').defaults.global.legend.onClick;

class TempLongConfig extends TempConfig {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(3).then(() => {
                this.configureChart();
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

                this.tempHandler(8);
                resolve(this.config);
            })
        })
    }
}
export default TempLongConfig;