export = umd;
declare class umd {
  static ReadableState(options: any, stream: any, isDuplex: any): void;
  constructor(value: any, replacer: any, spaces: any, cycle: any);
  addListener(ev: any, fn: any): any;
  addToStack(value: any, key: any, index: any, parent: any): any;
  cycler(key: any, value: any): any;
  destroy(err: any, cb: any): any;
  emit(type: any, args: any): any;
  eventNames(): any;
  getMaxListeners(): any;
  isPaused(): any;
  listenerCount(type: any): any;
  listeners(type: any): any;
  off(type: any, listener: any): any;
  on(ev: any, fn: any): any;
  once(type: any, listener: any): any;
  path(): any;
  pause(): any;
  pipe(dest: any, pipeOpts: any): any;
  prependListener(type: any, listener: any): any;
  prependOnceListener(type: any, listener: any): any;
  processArray(current: any): any;
  processObject(current: any): void;
  processPrimitive(current: any): void;
  processPromise(current: any): any;
  processReadableObject(current: any, size: any): any;
  processReadableString(current: any, size: any): any;
  processStackTopItem(size: any): any;
  push(chunk: any, encoding: any): any;
  rawListeners(type: any): any;
  read(n: any): any;
  removeAllListeners(ev: any): any;
  removeFromStack(item: any): void;
  removeListener(ev: any, fn: any): any;
  resume(): any;
  setEncoding(enc: any): any;
  setMaxListeners(n: any): any;
  unpipe(dest: any): any;
  unshift(chunk: any): any;
  wrap(stream: any): any;
}
