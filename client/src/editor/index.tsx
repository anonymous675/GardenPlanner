import Garden from "./Garden";

export default Garden;

let idCounter = 0;

const PIXEL_RATIO = (function () {
    return (window && window.devicePixelRatio) || 1;
})();

interface ViewportConfig {
    container: HTMLElement;
    width: number;
    height: number;
    defaultLayers?: Array<Layer>;
}

export class Viewport {
    container: HTMLElement;
    layers: Layer[];
    scene: Scene;
    width = 0;
    height = 0;

    constructor(config: ViewportConfig) {
        this.container = config.container;
        this.layers = config.defaultLayers || [];
        this.scene = new Scene();

        this.setSize(config.width || 0, config.height || 0);

        // clear container
        config.container.innerHTML = "";
        config.container.appendChild(this.scene.canvas);
    }

    add(layer: Layer) {
        this.layers.push(layer);
        layer.setSize(layer.width || this.width, layer.height || this.height);
        layer.viewport = this;
        return this;
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.scene.setSize(width, height);

        this.layers.forEach(function (layer) {
            layer.setSize(width, height);
        });

        return this;
    }

    getIntersection(x: number, y: number) {
        var layers = this.layers,
            len = layers.length,
            n,
            layer,
            key;

        for (n = len - 1; n >= 0; n--) {
            layer = layers[n];
            key = layer.hit.getIntersection(x, y);
            if (key >= 0) {
                return key;
            }
        }

        return -1;
    }

    render() {
        var scene = this.scene;

        scene.clear();

        this.layers.forEach(function (layer) {
            if (layer.visible) {
                scene.context.drawImage(
                    layer.scene.canvas,
                    0,
                    0,
                    layer.width,
                    layer.height
                );
            }
        });
    }
}

interface LayerConfig {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

export class Layer {
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    visible = true;
    id: number;
    hit: Hit;
    scene: Scene;
    viewport!: Viewport;

    constructor(config: LayerConfig = {}) {
        this.id = idCounter++;

        this.hit = new Hit();
        this.scene = new Scene();

        if (config.x && config.y) {
            this.setPosition(config.x, config.y);
        }
        if (config.width && config.height) {
            this.setSize(config.width, config.height);
        }
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.scene.setSize(width, height);
        this.hit.setSize(width, height);
        return this;
    }

    moveUp() {
        var index = this.getIndex()!,
            viewport = this.viewport,
            layers = viewport.layers;

        if (index < layers.length - 1) {
            // swap
            layers[index] = layers[index + 1];
            layers[index + 1] = this;
        }

        return this;
    }
    moveDown() {
        var index = this.getIndex()!,
            viewport = this.viewport,
            layers = viewport.layers;

        if (index > 0) {
            // swap
            layers[index] = layers[index - 1];
            layers[index - 1] = this;
        }

        return this;
    }
    moveToTop() {
        var index = this.getIndex()!,
            viewport = this.viewport,
            layers = viewport.layers;

        layers.splice(index, 1);
        layers.push(this);
    }
    moveToBottom() {
        var index = this.getIndex()!,
            viewport = this.viewport,
            layers = viewport.layers;

        layers.splice(index, 1);
        layers.unshift(this);

        return this;
    }

    getIndex() {
        var layers = this.viewport.layers,
            len = layers.length,
            n = 0,
            layer;

        for (n = 0; n < len; n++) {
            layer = layers[n];
            if (this.id === layer.id) {
                return n;
            }
        }

        return null;
    }

    destroy() {
        // remove self from layers array
        this.viewport.layers.splice(this.getIndex()!, 1);
    }
}

interface SceneConfig {
    width?: number;
    height?: number;
}

class Scene {
    width = 0;
    height = 0;
    contextType = "2d";
    id: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor(config: SceneConfig = {}) {
        this.id = idCounter++;
        this.canvas = document.createElement("canvas");
        this.canvas.className = "concrete-scene-canvas";
        this.canvas.style.display = "inline-block";
        this.context = this.canvas.getContext(
            this.contextType
        ) as CanvasRenderingContext2D;

        if (config.width && config.height) {
            this.setSize(config.width, config.height);
        }
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.canvas.width = width * PIXEL_RATIO;
        this.canvas.style.width = width + "px";
        this.canvas.height = height * PIXEL_RATIO;
        this.canvas.style.height = height + "px";

        if (this.contextType === "2d" && PIXEL_RATIO !== 1) {
            this.context.scale(PIXEL_RATIO, PIXEL_RATIO);
        }

        return this;
    }

    clear() {
        var context = this.context;
        if (this.contextType === "2d") {
            context.clearRect(
                0,
                0,
                this.width * PIXEL_RATIO,
                this.height * PIXEL_RATIO
            );
        }
        // webgl or webgl2
        // else {
        //     context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        // }
        return this;
    }
}

interface HitConfig {
    width?: number;
    height?: number;
}

class Hit {
    width = 0;
    height = 0;
    contextType = "2d";
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor(config: HitConfig = {}) {
        this.canvas = document.createElement("canvas");
        this.canvas.className = "concrete-hit-canvas";
        this.canvas.style.display = "none";
        this.canvas.style.position = "relative";
        this.context = this.canvas.getContext(this.contextType, {
            // have to add preserveDrawingBuffer so that we can pick colors with readPixels for hit detection
            preserveDrawingBuffer: true,
            // solve webgl antialiasing picking issue
            antialias: false,
        }) as CanvasRenderingContext2D;

        // this.hitColorIndex = 0;
        // this.keyToColor = {};
        // this.colorToKey = {};

        if (config.width && config.height) {
            this.setSize(config.width, config.height);
        }
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.canvas.width = width * PIXEL_RATIO;
        this.canvas.style.width = width + "px";
        this.canvas.height = height * PIXEL_RATIO;
        this.canvas.style.height = height + "px";
        return this;
    }
    /**
     * clear hit
     * @returns {Concrete.Hit}
     */
    clear() {
        var context = this.context;
        if (this.contextType === "2d") {
            context.clearRect(
                0,
                0,
                this.width * PIXEL_RATIO,
                this.height * PIXEL_RATIO
            );
        }
        // webgl or webgl2
        // else {
        //     context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        // }
        return this;
    }
    /**
     * get key associated to coordinate.  This can be used for mouse interactivity.
     * @param {Number} x
     * @param {Number} y
     * @returns {Integer} integer - returns -1 if no pixel is there
     */
    getIntersection(x: number, y: number) {
        var context = this.context,
            data;

        x = Math.round(x);
        y = Math.round(y);

        // if x or y are out of bounds return -1
        if (x < 0 || y < 0 || x > this.width || y > this.height) {
            return -1;
        }

        // 2d
        if (this.contextType === "2d") {
            data = context.getImageData(x, y, 1, 1).data;

            if (data[3] < 255) {
                return -1;
            }
        }

        return this.rgbToInt(data);
    }

    getColorFromIndex(index: number) {
        var rgb = this.intToRGB(index);
        return "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
    }

    rgbToInt(rgb: any) {
        var r = rgb[0];
        var g = rgb[1];
        var b = rgb[2];
        return (r << 16) + (g << 8) + b;
    }

    intToRGB(number: number) {
        var r = (number & 0xff0000) >> 16;
        var g = (number & 0x00ff00) >> 8;
        var b = number & 0x0000ff;
        return [r, g, b];
    }
}
