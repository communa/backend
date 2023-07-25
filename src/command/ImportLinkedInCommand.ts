import { App } from '../app/App';
import { createApp } from '../app/AppBootstrap';

import { ImporterLinkedIn } from '../service/import/ImporterLinkedIn';

(async () => {
  const app = await createApp();
  await app.boostrap();

  const importerLinkedIn: ImporterLinkedIn = App.container.get('ImporterLinkedIn');

  await importerLinkedIn.process(10000);

  await App.conn.close();
})()
  .then(r => {
    console.log(r);
    process.exit();
  })
  .catch(e => {
    console.log(e);
    process.exit();
  });
