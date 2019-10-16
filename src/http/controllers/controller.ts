
import { Request, Response } from 'express';
import { readFile } from 'fs';
import * as path from 'path';
import { join } from 'path';

import { Inject } from '@andrei-tatar/ts-ioc';

export abstract class Controller {
    private static templateCache: _.Dictionary<Promise<string>> = {};

    @Inject('response')
    public readonly response: Response;

    @Inject('request')
    public readonly request: Request;

    protected async renderTemplate(name: string, data?: any) {
        let templatePromise = Controller.templateCache[name];
        if (!templatePromise) {
            Controller.templateCache[name] = templatePromise = new Promise<string>((resolve, reject) => {
                readFile(join(__dirname, `${name}.html`), (err, file) => {
                    if (err) { reject(err); } else { resolve(file.toString()); }
                });
            });
        }

        const template = await templatePromise;
        return data ? template.replace(/\{\{(\w+)\}\}/mg, (_, id) => data[id] || '') : template;
    }

    public redirectUrl(url: string): string {
        let absPath = url;
        if (typeof this.request.baseUrl === 'string' &&
            this.request.baseUrl.length &&
            !url.startsWith(this.request.baseUrl)) {
        // namespace of express
            absPath = path.posix.join(this.request.baseUrl, url);
        }
        if (typeof process.env.ENTRY_POINT === 'string') {
            absPath = path.posix.join(`/${process.env.ENTRY_POINT}`, url);
        }
        // console.log('redirect:', absPath, process.env.ENTRY_POINT);
        return absPath;
    }
}
