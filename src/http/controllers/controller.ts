
import { Request, Response } from 'express';
import { readFile } from 'fs';
import path from 'path';

import { Inject } from '@andrei-tatar/ts-ioc';

import { Config } from '../../config';
import { ConfigService } from '../../services/config.service';

function resolvDataFromId(data: any, id: string) {
  return id.split('.').reduce((r, v) => {
    if (typeof r[v] === 'undefined') {
        return `[NOTFOUND:${id}]`;
    }
    return r[v];
  }, data);
}

export abstract class Controller {
    private static templateCache: _.Dictionary<Promise<string>> = {};

    @Inject('response') protected readonly response: Response;
    @Inject('request') protected readonly request: Request;
    @Inject(ConfigService) protected readonly config: Config;

    protected absUrl(url: string) {
        return path.join(this.config.redirectBaseUrl.val, url);
    }

    protected redirect(url: string) {
        return this.response.redirect(this.absUrl(url));
    }

    protected async renderTemplate(name: string, data?: any) {
        let templatePromise = Controller.templateCache[name];
        if (!templatePromise) {
            Controller.templateCache[name] = templatePromise = new Promise<string>((resolve, reject) => {
                readFile(path.join(__dirname, `${name}.html`), (err, file) => {
                    if (err) { reject(err); } else { resolve(file.toString()); }
                });
            });
        }

        const template = await templatePromise;
        return data ? template.replace(/\{\{(\w+(\.\w+)*)\}\}/mg, (_, id) => resolvDataFromId(data, id) || '') : template;
    }

}
