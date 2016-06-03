import {provide} from '@angular/core';
import {Http, BaseRequestOptions} from '@angular/http';
import {RouteSegment} from '@angular/router';

import {it, inject, beforeEachProviders, beforeEach} from '@angular/core/testing';
import {MockBackend} from '@angular/http/testing';

import {LolApiService} from '../../misc/lolapi.service';
import {MasteriesComponent} from './masteries.component';
import {MasteryCategoryComponent} from './mastery-category.component';
import {MasteryTierComponent} from './mastery-tier.component';
import {MasteryComponent} from './mastery.component';

import {MockRouteSegment} from '../../testing';

describe('MasteryTierComponent', () => {
  beforeEachProviders(() => [
    provide(RouteSegment, { useValue: new MockRouteSegment({ region: 'euw' }) }),

    BaseRequestOptions,
    MockBackend,
    provide(Http, {
      useFactory: (backend, defaultOptions) => {
        return new Http(backend, defaultOptions);
      },
      deps: [MockBackend, BaseRequestOptions]
    }),

    LolApiService,
    MasteriesComponent,
    MasteryCategoryComponent,
    MasteryTierComponent
  ]);

  // beforeEach(inject([MasteryTierComponent], (component) => {
  //   let masteryComponent1 = new MasteryComponent();
  //   masteryComponent1.setRank(2);
  //   let masteryComponent2 = new MasteryComponent();
  //   masteryComponent2.setRank(1);
  //   component.children = [masteryComponent1, masteryComponent2];
  // }));

  // it('should be initialised', inject([MasteryTierComponent], (component) => {
  //   expect(component.data).not.toBeDefined();
  //   expect(component.index).toBe(0);
  // }));


  // it('should enable', inject([MasteryTierComponent], (component) => {
  //   component.enable();
  //   for (let mastery of component.children) {
  //     expect(mastery.enabled).toBeTruthy();
  //   }
  //   expect(component.children.length).toBe(2);
  // }));

  // it('should disable', inject([MasteryTierComponent], (component) => {
  //   component.disable();
  //   for (let mastery of component.children) {
  //     expect(mastery.enabled).toBeFalsy();
  //   }
  //   expect(component.children.length).toBe(2);
  // }));

  // it('should lock', inject([MasteryTierComponent], (component) => {
  //   component.lock();
  //   for (let mastery of component.children) {
  //     expect(mastery.locked).toBeTruthy();
  //   }
  //   expect(component.children.length).toBe(2);
  // }));

  // it('should unlock', inject([MasteryTierComponent], (component) => {
  //   component.unlock();
  //   for (let mastery of component.children) {
  //     expect(mastery.locked).toBeFalsy();
  //   }
  // }));


  // it('should get rank', inject([MasteryTierComponent], (component) => {
  //   let masteryComponent1 = new MasteryComponent();
  //   masteryComponent1.enable();
  //   masteryComponent1.setRank(2);
  //   let masteryComponent2 = new MasteryComponent();
  //   masteryComponent2.enable();
  //   masteryComponent2.setRank(1);
  //   component.children = [masteryComponent1, masteryComponent2];
  //   expect(component.getRank()).toBe(3);
  // }));

  // it('should add mastery rank', inject([MasteryTierComponent], (component) => {
  //   let masteryComponent = new MasteryComponent();
  //   masteryComponent.data = { ranks: 5 };
  //   masteryComponent.enable();
  //   masteryComponent.setRank(1);
  //   component.rankAdd(masteryComponent);
  //   expect(masteryComponent.getRank()).toBe(2);
  // }));

  // it('should set mastery rank to max when rank is zero', inject([MasteryTierComponent], (component) => {
  //   let masteryComponent = new MasteryComponent();
  //   masteryComponent.data = { ranks: 5 };
  //   masteryComponent.enable();
  //   component.rankAdd(masteryComponent);
  //   expect(masteryComponent.getRank()).toBe(5);
  // }));


  // it('should trigger category rankAdd event', inject([MasteryTierComponent], (component) => {
  //   spyOn(component.rankAdded, 'emit');
  //   expect(component.rankAdded.emit).not.toHaveBeenCalled();
  //   let masteryComponent = new MasteryComponent();
  //   component.rankAdd(masteryComponent);
  //   expect(component.rankAdded.emit).toHaveBeenCalled();
  // }));

  // it('should trigger category rankRemoved event', inject([MasteryTierComponent], (component) => {
  //   spyOn(component.rankRemoved, 'emit');
  //   expect(component.rankRemoved.emit).not.toHaveBeenCalled();
  //   let masteryComponent = new MasteryComponent();
  //   component.rankRemove(masteryComponent);
  //   expect(component.rankRemoved.emit).toHaveBeenCalled();
  // }));
});
