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
        this.setTitle = this.setTitle.bind(this);
        this.labelCallback = this.labelCallback.bind(this);
        this.midnightLineMark = this.midnightLineMark.bind(this);
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

    setTitle(title) {
        this.config.options.title.text = title;
    }

    labelCallback() {
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
    }

    midnightLineMark(time) {
        if (time === "12:00am") {
            this.config.options.scales.xAxes[0].gridLines.lineWidth.push(1);
            this.config.options.scales.xAxes[0].gridLines.color.push("rgba(0,0,0,0.5");
        } else {
            this.config.options.scales.xAxes[0].gridLines.lineWidth.push(1);
            this.config.options.scales.xAxes[0].gridLines.color.push("rgba(0,0,0,0.1)");
        }
    }
}
export default Config;