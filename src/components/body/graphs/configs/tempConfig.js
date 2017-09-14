import Config from './config';

class TempConfig extends Config {
    constructor(data) {
        super(data);
        this.configureChart = this.configureChart.bind(this);
    }

    configureChart() {
        this.setTitle("Temperature & Dewpoint");
    }
}
export default TempConfig;