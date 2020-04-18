import { State } from './state';

export interface ColorState extends State {
    color: {
        /**
         * @minimum 2000
         * @maximum 6000
         */
        temperature?: number;
        RGB?: {
            /**
             * @minimum 0
             * @maximum 255
             */
            r: number;
            /**
             * @minimum 0
             * @maximum 255
             */
            g: number;
            /**
             * @minimum 0
             * @maximum 255
             */
            b: number;
        };
        HSV?: {
            /**
             * @minimum 0
             * @maximum 360
             */
            h: number;
            /**
             * @minimum 0
             * @maximum 1
             */
            s: number;
            /**
             * @minimum 0
             * @maximum 1
             */
            v: number;
        };
    };
}
