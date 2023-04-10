import {injectable, inject} from 'inversify';
import {ApiPromise, WsProvider} from '@polkadot/api';
import {Header} from '@polkadot/types/interfaces/runtime';

import {IConfigParameters} from '../interface/IConfigParameters';

@injectable()
export class SubstrateConnector {
  @inject('parameters')
  protected parameters: IConfigParameters;

  public api: ApiPromise;

  public async connect(): Promise<ApiPromise> {
    const provider = new WsProvider(this.parameters.substrate);

    this.api = await ApiPromise.create({provider});

    return this.api;
  }

  public disconnect(): void {
    if (this.api.isConnected) {
      void this.api.disconnect();
    }
  }

  public async queryEvents(header: Header) {
    const at = await this.api.at(header.hash);
    const events = await at.query.system.events();
    const human: any = events.toHuman();

    human.map((_h: any) => {
      // console.log(h.event.data);
    });
  }

  public async connectAndListenNewBlocks() {
    await this.connect();

    void this.api.rpc.chain.subscribeNewHeads(header => {
      // console.log(`Chain is at block: #${header.number.toString()}`);

      void this.queryEvents(header);
    });
  }
}
