import { State } from './state';

export interface ColorTemperature {
    /**
     * @minimum 2000
     * @maximum 6000
     */
    temperatureK?: number;
}

// export interface ColorRGB {
//         /**
//          * @minimum 0
//          * @maximum 255
//          */
//         r: number;
//         /**
//          * @minimum 0
//          * @maximum 255
//          */
//         g: number;
//         /**
//          * @minimum 0
//          * @maximum 255
//          */
//         b: number;
// }

export interface ColorHue {
    /**
     * @minimum 0
     * @maximum 360
     */
    hue: number;
    /**
     * @minimum 0
     * @maximum 1
     */
    saturation: number;
    /**
     * @minimum 0
     * @maximum 1
     */
    value: number;
}

// export interface ColorHSV {
//     /**
//      * @minimum 0
//      * @maximum 360
//      */
//     h: number;
//     /**
//      * @minimum 0
//      * @maximum 1
//      */
//     s: number;
//     /**
//      * @minimum 0
//      * @maximum 1
//      */
//     v: number;
// }

export interface ColorState extends State {
    color: Partial<ColorTemperature> &
      {
        //   RGB?: ColorRGB;
        //   HSV?: ColorHSV;
          spectrumRgb?: number;
          spectrumHsv?: ColorHue;
      };
}
