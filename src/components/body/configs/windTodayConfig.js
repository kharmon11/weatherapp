import WindConfig from './windConfig';

class WindTodayConfig extends WindConfig {
    constructor(data) {
        super(data);
        this.create = this.create.bind(this);
    }

    create() {
        return new Promise((resolve, reject) => {
            this.createDatasetObjects(2).then(() => {
                this.configureChart(); 
                this.windDataHandler(24);
                resolve(this.config);
            });
        })
    }
}
export default WindTodayConfig;