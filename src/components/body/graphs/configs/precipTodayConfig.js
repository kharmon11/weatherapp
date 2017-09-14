import PrecipConfig from './precipConfig';

class PrecipTodayConfig extends PrecipConfig {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(4).then(() => {
                this.configureChart();
                this.nonPrecipRateHandler(24);
                const rainData = this.precipRateHandler(24);
                this.config.data.datasets[3].data = rainData.category;
                resolve(this.config);
            })
        })
    }
}
export default PrecipTodayConfig;