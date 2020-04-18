import { BaseDevice } from './device';
import { BrightnessState } from './states/brightness';
import { ColorHSV, ColorRGB, ColorTemperature } from './states/color';
import { OnOffState } from './states/onoff';

export type LightDevice = BaseDevice & {
    type: 'light';
    brightnessControl: false;
    colorControlModel: 'none' | 'rgb' | 'hsv';
    colorControlTemperature?: { minK: number, maxK: number };
    state: OnOffState;
};

export type LightDeviceWithBrightness = LightDevice & {
    brightnessControl: true;
    colorControlModel: 'none';
    state: BrightnessState & OnOffState;
};

export function isLightWithBrightness(dev: LightDevice): dev is LightDeviceWithBrightness {
    return dev.brightnessControl;
}

export type LightDeviceWithColorTemperature = LightDevice & {
    state: ColorTemperature;
};

export function isLightWithColorControlTemperature(dev: LightDevice): dev is LightDeviceWithColorTemperature {
    return !!dev.colorControlTemperature;
}


export type LightDeviceWithColorRGB = LightDevice & {
    brightnessControl: true;
    colorControlModel: 'rgb';
    state: BrightnessState & ColorTemperature & { RGB: ColorRGB } & OnOffState;
};

export function isLightWithColorRGB(dev: LightDevice): dev is LightDeviceWithColorRGB {
    return dev.colorControlModel === 'rgb';
}


export type LightDeviceWithColorHSV = LightDevice & {
    brightnessControl: true;
    colorControlModel: 'hsv';
    colorControlTemperature?: { minK: number, maxK: number };
    state: BrightnessState & ColorTemperature & { HSV: ColorHSV } & OnOffState;
}

export function isLightWithColorHSV(dev: LightDevice): dev is LightDeviceWithColorHSV {
    return dev.colorControlModel === 'hsv';
}