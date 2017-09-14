import PrecipConfig from './precipConfig';

class PrecipLongConfig extends PrecipConfig {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(4).then(() => {
                this.configureChart();
                this.nonPrecipRateHandler(8);
                const rainData = this.precipRateHandler(8);
                this.config.data.datasets[3].data = rainData.category;
                console.log(this.config);
                resolve(this.config);
            })
        })
    }
}
export default PrecipLongConfig;