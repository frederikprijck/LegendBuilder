import {async, inject, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';

import {settings} from '../../../config/settings';
import {environment} from '../../environments/environment';
import {Endpoint, LolApiService} from '../services/lolapi.service';
import {TestModule} from '../testing';

describe('LolApiService', () => {
  beforeEach(() => {
    environment.production = false;
    TestBed.configureTestingModule({providers: [LolApiService], imports: [TestModule]});
  });

  it('should get realm data', async(inject([LolApiService], (service) => {
       service.getRealm().subscribe(
           res => {
             expect(res).toBeDefined();
           },
           () => {
             fail('unexpected failure');
           });
     })));

  it('should get regions', async(inject([LolApiService], (service) => {
       service.getRegions().subscribe(
           res => {
             expect(res).toBeDefined();
             expect(res[0].slug).toBe('euw');
           },
           () => {
             fail('unexpected failure');
           });
     })));

  it('should get champions', async(inject([LolApiService], (service) => {
       service.getChampions().subscribe(
           res => {
             expect(res).toBeDefined();
           },
           () => {
             fail('unexpected failure');
           });
     })));

  it('should get champion', async(inject([LolApiService], (service) => {
       service.getChampion(0).subscribe(
           res => {
             expect(res).toBeDefined();
           },
           () => {
             fail('unexpected failure');
           });
     })));

  it('should get items', async(inject([LolApiService], (service) => {
       service.getItems().subscribe(
           res => {
             expect(res).toBeDefined();
           },
           () => {
             fail('unexpected failure');
           });
     })));

  it('should get masteries', async(inject([LolApiService], (service) => {
       service.getMasteries().subscribe(
           res => {
             expect(res).toBeDefined();
           },
           () => {
             fail('unexpected failure');
           });
     })));

  it('should get accountId', async(inject([LolApiService], (service) => {
       service.getAccountId('', '').subscribe(
           res => {
             expect(res).toBeDefined();
           },
           () => {
             fail('unexpected failure');
           });
     })));

  it('should get matchData', async(inject([LolApiService], (service) => {
       service.getMatchData(0, '', 0, 0)
           .subscribe(
               res => {
                 expect(res).toBeDefined();
               },
               () => {
                 fail('unexpected failure');
               });
     })));

  it('should get current region', async(inject([LolApiService], (service) => {
       service.getCurrentRegion().subscribe(
           res => {
             expect(res).toBe('euw');
           },
           () => {
             fail('unexpected failure');
           });
     })));

  it('should get current champion', async(inject([LolApiService], (service) => {
       service.getCurrentChampion().subscribe(
           res => {
             expect(res).toBeDefined();
           },
           () => {
             fail('unexpected failure');
           });
     })));

  it('should get current matchData', async(inject([LolApiService], (service) => {
       service.getCurrentMatchData().subscribe(
           res => {
             expect(res).toBeDefined();
           },
           () => {
             fail('unexpected failure');
           });
     })));

  it('should handle an incorrect region',
     async(inject([Router, LolApiService], (router, service) => {
       router.setRegion('not a region');

       service.getRealm().subscribe(
           () => {
             fail('unexpected success');
           },
           (error) => {
             expect(error.message).toHaveEqualContent('Region does not exist');
           });
     })));

  it('should get the correct resolved link to the static-server',
     inject([LolApiService], (service) => {
       expect(service.getEndpoint(Endpoint.static))
           .toBe('https://' + settings.domain + ':' + settings.static.port + '/');
     }));

  it('should get the correct resolved link to the match-server',
     inject([LolApiService], (service) => {
       expect(service.getEndpoint(Endpoint.match))
           .toBe('https://' + settings.domain + ':' + settings.match.port + '/');
     }));

  it('should get the correct resolved link to the static-server --prod',
     inject([LolApiService], (service) => {
       environment.production = true;
       expect(service.getEndpoint(Endpoint.static))
           .toBe('https://' + settings.domain + '/staticapi/');
     }));

  it('should get the correct resolved link to the match-server --prod',
     inject([LolApiService], (service) => {
       environment.production = true;
       expect(service.getEndpoint(Endpoint.match))
           .toBe('https://' + settings.domain + '/matchapi/');
     }));

  it('should not get incorrect params', inject([LolApiService], (service) => {
       service.getParam(5).subscribe(
           () => {
             fail('unexpected success');
           },
           (error) => {
             expect(error.message).toHaveEqualContent('Incorrect parameter');
           });
     }));
});
