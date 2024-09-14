class City {
    constructor(size) {
        this.size = size;
        this.data = [];

        this.initialize();
    };

    initialize() {
        for (let x = 0; x < this.size; x++) {
            const column = [];
            for (let y = 0; y < this.size; y++) {
                const tile = { 
                    x, 
                    y,
                    building: undefined,
                    update() {
                        const x = Math.random();
                        if (x < 0.01) {
                            if (this.building === undefined) {
                                this.building = "building-1";
                            } else if (this.building === "building-1") {
                                this.building = "building-2";
                            } else if (this.building === "building-2") {
                                this.building = "building-3";
                            }
                        }
                    },
                };
                column.push(tile);
            };
            this.data.push(column);
        };
    };

    update() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const tile = this.data[x][y];
                tile.update();
            };
        };
    };
};

export default City;