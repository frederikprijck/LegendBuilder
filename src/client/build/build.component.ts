import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {settings} from '../../../config/settings';
import {DDragonDirective} from '../misc/ddragon.directive';
import {LoadingComponent} from '../misc/loading.component';
import {RetryComponent} from '../misc/retry.component';
import {LolApiService} from '../services/lolapi.service';

import {GraphComponent} from './graph/graph.component';
import {Item} from './item';
import {ItemsComponent} from './items/items.component';
import {MasteriesComponent} from './masteries/masteries.component';
import {Samples} from './samples';
import {BuildService} from './services/build.service';
import {StatsService} from './services/stats.service';
import {ShopComponent} from './shop/shop.component';

@Component({
  providers: [BuildService, StatsService, LolApiService],
  directives: [
    GraphComponent, ItemsComponent, MasteriesComponent, ShopComponent, DDragonDirective,
    LoadingComponent, RetryComponent
  ],
  encapsulation: ViewEncapsulation.None,
  styles: [require('./build.css').toString()],
  template: `
    <div class="title">
      <img *ngIf="champion" [ddragon]="'champion/' + champion?.image?.full">
      <h2>{{champion?.name}}</h2>
    </div>
    <graph [champion]="champion"></graph>
    <masteries></masteries>
    <items #items></items>
    <shop (itemPicked)="items.addItem($event)"></shop>
    <loading [loading]="loading"></loading>
    <retry [error]="error" (retry)="getData()"></retry>`
})

export class BuildComponent implements OnInit {
  private championKey: string;
  private champion: any;
  private loading: boolean = true;
  private error: boolean = false;


  constructor(
      private route: ActivatedRoute, private stats: StatsService, private build: BuildService,
      private lolApi: LolApiService) {}

  ngOnInit() {
    this.championKey = this.route.snapshot.params['champion'];
    this.getData();

    let summoner = this.route.snapshot.params['summoner'];
    this.getMatchData(summoner);
  }

  getData() {
    this.loading = true;
    this.error = false;

    this.lolApi.getChampion(this.championKey)
        .subscribe(
            res => this.champion = res,
            error => {
              this.error = true;
              this.loading = false;
            },
            () => {
              this.loading = false;
            });
  }

  getMatchData(value: string) {
    this.lolApi
        .getMatchData(value, this.championKey, settings.gameTime, settings.matchServer.sampleSize)
        .subscribe(
            res => {
              this.build.samples.notify(res);
            },
            error => {
              this.error = true;
            });
  }
}
