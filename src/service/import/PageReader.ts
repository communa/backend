import {JSDOM} from 'jsdom';
import {inject, injectable} from 'inversify';
import {Readability} from '@mozilla/readability';

import {Http} from '../Http';
import {IText} from '../../interface/IText';
import {ArticleRenderer} from './ArticleRenderer';

@injectable()
export class PageReader {
  @inject('Http')
  protected http: Http;
  @inject('ArticleRenderer')
  protected articleRenderer: ArticleRenderer;

  public static ERROR_NO_CONTENT = 'ERROR_NO_CONTENT';
  public static TIMEOUT_MS = 10000;

  public async renderAndRead(url: string): Promise<IText> {
    const page = await this.articleRenderer.renderByUrl(url);

    return this.read(page, url);
  }

  public async readByUrl(url: string): Promise<IText> {
    const response = await this.http.request({
      url,
      timeout: PageReader.TIMEOUT_MS,
    });

    return this.read(response.data, url);
  }

  public async read(html: string, url: string): Promise<IText> {
    const text = {
      html: '',
      plain: '',
    };
    let error = '';
    let title = '';

    try {
      const doc = new JSDOM(html, {
        url,
      });

      const reader = new Readability(doc.window.document);
      const page = reader.parse();

      if (page && page.content) {
        text.html = page.content;
        text.plain = page.textContent;
        title = page.title;
      } else {
        error = PageReader.ERROR_NO_CONTENT;
      }
    } catch (e: any) {
      error = e.message;
    }

    return Promise.resolve({
      title,
      url,
      text,
      error,
      html,
    });
  }
}
