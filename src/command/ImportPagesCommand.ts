import { App } from '../app/App';
import { ImporterWebPage } from '../service/import/ImporterWebPage';
import { createApp } from '../app/AppBootstrap';

(async () => {
  const app = await createApp();
  await app.boostrap();
  const importerWebPage: ImporterWebPage = App.container.get('ImporterWebPage');
  await importerWebPage.process(500000);

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
