import { App } from '../app/App';
import { createApp } from '../app/AppBootstrap';
import { WebsiteManager } from '../service/WebsiteManager';
import { ImporterWebSite } from '../service/import/ImporterWebSite';

(async () => {
  const app = await createApp();
  await app.boostrap();
  const websiteManager: WebsiteManager = App.container.get('WebsiteManager');
  const importerWebSite: ImporterWebSite = App.container.get('ImporterWebSite');

  const sitemap = 'https://cryptocurrencyjobs.co/sitemap.xml';

  const webSite = await websiteManager.findOrCreateBySitemap(sitemap);
  await importerWebSite.processSitemap(webSite);

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
