
import { Request, Response } from 'express';
import { readFile } from 'fs';
import * as path from 'path';
import { join } from 'path';

import { Inject } from '@andrei-tatar/ts-ioc';
import { Config } from '../../services/config';
import { ConfigService } from '../../services/config.service';

export abstract class Controller {
    private static templateCache: _.Dictionary<Promise<string>> = {};

    @Inject('ConfigService')
    public readonly configSrv: ConfigService;

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

    public async config(): Promise<Config> {
        return await this.configSrv.init();
    }


    public async redirectUrl(url: string): Promise<string> {
        let absPath = url;
        const baseUrl = (await this.config()).baseUrl;
        if (baseUrl) {
            absPath = path.posix.join(baseUrl, url);
        }
        // node 8 gcloud functions
        if (typeof process.env.ENTRY_POINT === 'string') {
            absPath = path.posix.join(`/${process.env.ENTRY_POINT}`, url);
        }
        // node 10 gcloud functions
        if (typeof process.env.FUNCTION_TARGET === 'string') {
            absPath = path.posix.join(`/${process.env.FUNCTION_TARGET}`, url);
        }
        // console.log('redirectUrl:', url, absPath,
        //     baseUrl,
        //     JSON.stringify(process.env));
        return absPath;
    }

    public async redirect(url: string) {
        this.response.redirect(await this.redirectUrl(url));
    }
}
