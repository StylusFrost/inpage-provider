import { Duplex } from 'stream'

export default class DuplexStream extends Duplex {
  constructor() {
    super({
      objectMode: true,
    })
  }

  pushToSubstream(name: string, data: any) {
    this.push({ name, data })
  }

  _write(_data: any, _encoding: any, callback: Function) {
    callback()
  }

  _read() {}
}
