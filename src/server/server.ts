import {IncomingMessage, ServerResponse} from 'http';
import * as https from 'https';
import * as nodeurl from 'url';
import * as zlib from 'zlib';

const lru = require('lru-cache');
import {retry} from 'async';
import * as minimist from 'minimist';

import {ColorConsole} from './console';
import {settings} from '../../config/settings';
import {Helpers} from './helpers';

export interface HostResponse {
  data: any;
  json?: any;
  status: number;
  success: boolean;
}

export function getPathname(path: string): Array<string> {
  return nodeurl.parse(path).pathname.split('/');
}

export function getQuery(path: string): any {
  return nodeurl.parse(path, true).query;
}

export interface HttpError {
  status: number;
  message: string;
}

export class Server {
  static hostname = '.api.riotgames.com';
  static protocol = 'https://';
  static headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Encoding': 'gzip',
    'Content-Type': 'application/json'
  };

  champions: Array<Array<string>> = [];

  private cache;
  private server;
  private callb;

  private ssl = {cert: '', key: ''};
  private apiKey = '';

  constructor(private port: number, cacheSettings?: any, private preRun?: () => void) {
    const argv = minimist(process.argv.slice(2));

    this.apiKey = Helpers.readFile(argv['api']).replace(/^\s+|\s+$/g, '');
    Helpers.watchFile(argv['api'], file => this.apiKey = file.replace(/^\s+|\s+$/g, ''));

    this.ssl.cert = Helpers.readFile(argv['cert']);
    Helpers.watchFile(argv['cert'], file => {
      this.ssl.cert = file;
      this.restart();
    });

    this.ssl.key = Helpers.readFile(argv['key']);
    Helpers.watchFile(argv['key'], file => {
      this.ssl.key = file;
      this.restart();
    });

    this.cache = lru(this.merge(
        cacheSettings, {max: 1048576, length: n => n.length * 2, maxAge: 1000 * 60 * 60 * 2}));
  }

  static getBaseUrl(region: string) {
    return this.protocol + this.getHostname(region) + '/lol/';
  }

  static getHostname(region: string) {
    return region + this.hostname;
  }

  run(callback: (req: IncomingMessage, resp: ServerResponse) => void): void {
    if (this.preRun) {
      this.preRun();
    }
    this.getChampionsByRegion();
    this.callb = callback;
    this.start(callback);
  }

  restart() {
    if (this.server) {
      try {
        this.server.close(() => this.start(this.callb));
      } catch (e) {
        console.log(e);
      }
    } else {
      this.start(this.callb);
    }
  }

  sendRequest(url: string, region: string, callback: (response: HostResponse) => void, opts?: {
    times: number,
    interval: number
  }): void {
    const path = this.transformPath(url, region);
    const options = this.getOptions(region, {path: path});
    this.sendHttpsRequest(options, callback, opts);
  }

  setCache(url: string, data: any): void {
    this.cache.set(url, data);
  }

  private getCache(url: string): any {
    return this.cache.get(url);
  }

  private sendHttpsRequest(
      options: https.RequestOptions, callback: (response: HostResponse) => void,
      opts?: {times: number, interval: number}) {
    const console = new ColorConsole();
    retry(
        opts || {times: 1, interval: 0},
        (cb: any) => {
          const req = https.request(options, (res: IncomingMessage) => {
            cb(undefined, res);
          });
          req.on('error', (e: Error) => {
            cb(e, undefined);
          });
          req.end();
        },
        (error: Error, results: any) => {
          if (error) {
            this.handleResponseError(
                console, options, {status: 400, message: error.message}, callback);
          } else {
            this.handleResponse(console, options, results, callback);
          }
        });
  }

  private handleResponse(
      console: ColorConsole, options: https.RequestOptions, res: IncomingMessage,
      callback: (response: HostResponse) => void) {
    let stream: any;

    switch (res.headers['content-encoding']) {
      case 'gzip':
        stream = res.pipe(zlib.createGunzip());
        break;
      default:
        stream = res;
        break;
    }

    let data = '';
    stream.on('data', (chunk) => {
      data += chunk;
    });
    stream.on('end', () => {
      this.handleResponseSuccess(console, options, res, data, callback);
    });
  }

  private handleResponseSuccess(
      console: ColorConsole, options: https.RequestOptions, res: IncomingMessage, data: any,
      callback: (response: HostResponse) => void) {
    if (res.statusCode !== 200) {
      const error: HttpError = {status: res.statusCode, message: res.statusMessage};
      this.handleResponseError(console, options, error, callback);
      return;
    }

    const json = Helpers.jsonParse(data);
    if (json.status) {
      const error: HttpError = {status: json.status.status_code, message: json.status.message};
      this.handleResponseError(console, options, error, callback);
      return;
    }

    const response: HostResponse =
        {data: data, json: json, status: res.statusCode, success: res.statusCode === 200};
    console.logHttp(options.method, options.path, res.statusCode);
    callback(response);
  }

  private handleResponseError(
      console: ColorConsole, options: https.RequestOptions, e: HttpError,
      callback: (response: HostResponse) => void) {
    const response: HostResponse = {data: e.message, status: e.status, success: false};
    console.logHttp(options.method, options.path, e.status, e.message);
    callback(response);
  }

  private handleRequest(
      request: IncomingMessage, response: ServerResponse,
      callback: (req: IncomingMessage, resp: ServerResponse) => void): void {
    const console = new ColorConsole();
    const cachedResponseData = this.getCache(request.url);
    if (cachedResponseData) {
      response.writeHead(200, Server.headers);
      response.write(cachedResponseData);
      response.end();
      console.logHttp(
          'CACHED', request.url, 200,
          this.cache.length / 1000000 + 'MB/' + this.cache.max / 1000000 + 'MB');
      return;
    }

    console.logHttp(request.method, request.url, response.statusCode);
    callback(request, response);
  }

  private merge(src: Object, target: Object): Object {
    if (!src) {
      return;
    }
    for (const prop of Object.keys(src)) {
      target[prop] = src[prop];
    }
    return target;
  }

  private getChampionsByRegion() {
    for (const region of settings.api.regions) {
      this.champions[region] = [];
      retry(
          {
            times: Infinity,
            interval: retryCount => {
              const interval = 500 * Math.pow(2, retryCount);
              return interval < 60000 ? interval : 60000;
            }
          },
          (callback: any) => {
            this.getChampions(region, callback);
          },
          (err, result) => {
            if (!err) {
              this.champions[result.region] = result.data;
            }
          });
    }
  }

  private start(callback: (req: IncomingMessage, resp: ServerResponse) => void): void {
    try {
      this.server =
          https.createServer(this.ssl, (request: IncomingMessage, response: ServerResponse) => {
            this.handleRequest(request, response, callback);
          });
      this.server.listen(this.port);
      console.log('listening on port: ' + this.port);
    } catch (e) {
      console.log(e);
    }
  }

  private getChampions(region: string, callback: any) {
    const url = Server.getBaseUrl(region) + 'static-data/' + settings.api.versions['static-data'] +
        '/champions';

    const options = this.getOptions(region, {path: url});
    this.sendHttpsRequest(options, (response: HostResponse) => {
      if (response.success) {
        const data = [];
        for (const championKey of Object.keys(response.json.data)) {
          data[championKey.toLowerCase()] = response.json.data[championKey].id;
        }
        callback(undefined, {region: region, data: data});
      } else {
        console.error('Unable to get champion data for ' + region);
        callback(true);
      }
    });
  }

  private transformPath(path: string, region: string): string {
    return this.replaceChampion(path, region);
  }

  private replaceChampion(path: string, region: string): string {
    const championKey = this.getChampionKey(path);
    if (!championKey) {
      return path;
    }
    const championId = this.getChampionId(region, championKey);
    if (championId >= 0) {
      path = path.replace(championKey, championId);
    }
    return path;
  }

  private getChampionKey(path: string): string {
    const pathname = getPathname(path);
    if (pathname[4] === 'champions') {
      return pathname[5];
    }
    if (pathname[4] === 'matchlists') {
      const query = getQuery(path);
      return query.champion;
    }
    return undefined;
  }

  private getChampionId(region: string, championKey: string) {
    if (!this.champions[region]) {
      return 0;
    }
    return this.champions[region][championKey.toLowerCase()];
  }

  private getOptions(region: string, options?: https.RequestOptions): https.RequestOptions {
    return this.merge(
        {
          hostname: Server.getHostname(region),
          method: 'GET',
          headers: {
            'User-Agent': 'Legend-Builder',
            'Accept-Encoding': 'gzip',
            'Accept-Language': 'en-US',
            'Accept-Charset': 'ISO-8859-1,utf-8',
            'Origin': 'https://' + settings.domain,
            'X-Riot-Token': this.apiKey
          }
        },
        options);
  }
}
