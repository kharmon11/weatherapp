import TempConfig from './tempConfig';

class TempTodayConfig extends TempConfig {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(2).then(() => {
                // Chart Properties
                this.configureChart();
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

                this.tempHandler(24);
                resolve(this.config);    
            });
        });
    }
}
export default TempTodayConfig;