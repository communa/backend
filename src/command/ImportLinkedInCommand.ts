import {App} from '../app/App';
import {createApp} from '../app/AppBootstrap';

import {ImporterLinkedIn} from '../service/import/ImporterLinkedIn';

(async () => {
  const app = await createApp();
  await app.boostrap();

  const limit = Number(process.argv[3]);
  const keywords = String(process.argv[2]).split(',');
  const authCookie = String(process.argv[4]);
  const importerLinkedIn: ImporterLinkedIn = App.container.get('ImporterLinkedIn');

  await importerLinkedIn.process(keywords, limit, authCookie);

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
