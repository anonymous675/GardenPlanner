import { Viewport, Layer } from "./index";

interface GardenConfig {
    width: number;
    height: number;
    container: HTMLElement;
}

export default class Garden {
    width: number;
    height: number;
    viewport: Viewport;

    constructor(config: GardenConfig) {
        console.log("Garden Created");

        this.width = config.width;
        this.height = config.height;

        // this.plantsLayer = new Layer();

        this.viewport = new Viewport({
            container: config.container,
            width: 0,
            height: 0,
            defaultLayers: [],
        });
    }
}
