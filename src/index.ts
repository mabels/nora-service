import 'reflect-metadata';

import { getClassFactory } from '@andrei-tatar/ts-ioc/inject';
import { container } from './container';
import { MainService } from './services/main.service';

(async function() {
  await getClassFactory(MainService)(container).start();
})();
