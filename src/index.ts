import 'reflect-metadata';

import { container } from './container';
import { MainService } from './services/main.service';

(async function() {
  await container.resolve(MainService).start();
})();
