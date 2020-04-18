import { BaseDevice } from './device';
import { BrightnessState } from './states/brightness';
import { ColorHue, ColorTemperature } from './states/color';
import { OnOffState } from './states/onoff';

export type LightDevice = BaseDevice & {
    type: 'light';
    brightnessControl: boolean;
    turnOnWhenBrightnessChanges?: boolean; // when set: turn on light when brightness or color change
    colorControl?: boolean;
    colorControlModel?: 'none' | 'rgb' | 'hsv';
    colorControlTemperature?: { minK: number; maxK: number };
    state: BrightnessState & {
        color?: ColorTemperature & {
            spectrumRgb?: number;
            // HSV?: ColorHSV;
            spectrumHsv?: ColorHue;
            // RGB?: ColorRGB;
        };
    } & OnOffState;
};

// export type LightDeviceWithBrightness = LightDevice;
// export type LightDeviceWithColorHSV = LightDevice;
// export type LightDeviceWithColorRGB = LightDevice;

// export type LightDeviceWithBrightness = BaseDevice & {
//     type: 'light';
//     brightnessControl: true;
//     turnOnWhenBrightnessChanges?: boolean; // when set: turn on light when brightness or color change
//     colorControl: false;
//     colorControlTemperature?: { minK: number, maxK: number };
//     state: BrightnessState & { color: ColorTemperature } & OnOffState;
// };

// export type LightDeviceWithColorControl = BaseDevice & {
//     type: 'light';
//     brightnessControl: true;
//     turnOnWhenBrightnessChanges?: boolean;
//     colorControl?: boolean;
//     colorControlModel?: string,
//     colorControlTemperature?: { minK: number, maxK: number };
//     state: {
//         color: {
//             HSV?: ColorHSV
//             spectrumHsv?: ColorHue
//         } & ColorTemperature
//     } & BrightnessState & OnOffState;
// };

// export type LightDeviceWithColorHSV = BaseDevice & {
//     type: 'light';
//     brightnessControl: true;
//     turnOnWhenBrightnessChanges?: boolean;
//     colorControl?: boolean;
//     colorControlModel?: 'hsv',
//     colorControlTemperature?: { minK: number, maxK: number };
//     state: {
//         color: {
//             HSV?: ColorHSV
//             spectrumHsv?: ColorHue
//         } & ColorTemperature
//     } & BrightnessState & OnOffState;
// };
// export type LightDeviceWithColorHSV = LightDeviceWithColorControl;
// export type LightDeviceWithColorRGB = LightDeviceWithColorControl;

// export type LightDeviceWithColorRGB = BaseDevice & {
//     type: 'light';
//     brightnessControl: true;
//     turnOnWhenBrightnessChanges?: boolean;
//     // colorControl?: false;
//     colorControlModel: 'rgb',
//     colorControlTemperature?: { minK: number, maxK: number };
//     state: {
//         color: {
//             RGB?: ColorRGB
//         } & ColorTemperature
//     } & BrightnessState & OnOffState;
// };
// export type LightDevice = BaseDevice & {
//     type: 'light';
//     brightnessControl: false;
//     colorControl?: boolean;
//     colorControlModel?: string; // 'none' | 'rgb' | 'hsv';
//     colorControlTemperature?: { minK: number, maxK: number };
//     state: OnOffState;
// };

// export type LightDeviceWithBrightness = BaseDevice & {
//     type: 'light';
//     brightnessControl: true;
//     colorControlModel?: string; // 'none' | 'rgb' | 'hsv';
//     colorControlTemperature?: { minK: number, maxK: number };
//     state: BrightnessState & OnOffState;
// };

export function isLightWithBrightness(dev: LightDevice): dev is LightDevice {
    return dev.brightnessControl;
}

// export type LightDeviceWithColorTemperature = LightDevice & {
//     state: ColorTemperature;
// };

export function isLightWithColorControlTemperature(dev: LightDevice): dev is LightDevice {
    return !!dev.colorControlTemperature;
}

// export type LightDeviceWithColorRGB = BaseDevice & {
//     type: 'light';
//     brightnessControl: true;
//     colorControl?: false;
//     colorControlModel: 'rgb';
//     colorControlTemperature?: { minK: number, maxK: number };
//     state: BrightnessState & ColorTemperature & { RGB: ColorRGB } & OnOffState;
// };

export function isLightWithColorRGB(dev: LightDevice): dev is LightDevice {
    return dev.colorControlModel === 'rgb';
}

// export type LightDeviceWithColorHSV = BaseDevice & {
//     type: 'light';
//     brightnessControl: true;
//     colorControl?: true;
//     colorControlModel: 'hsv';
//     colorControlTemperature?: { minK: number, maxK: number };
//     state: BrightnessState & ColorTemperature & { HSV: ColorHSV } & OnOffState;
// }

export function isLightWithColorHSV(dev: LightDevice): dev is LightDevice {
    return dev.colorControlModel === 'hsv' || !!dev.colorControl;
}
