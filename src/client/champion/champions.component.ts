import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {LolApiService} from '../services';

import {ChampionComponent} from './champion.component';

@Component({
  selector: 'lb-champions',
  styleUrls: ['./champions.component.scss'],
  template: `
    <div class="content">
      <lb-filters [(tags)]="tags" [(name)]="name" [(sort)]="sort" (enterHit)="enterHit()">
      </lb-filters>
      <lb-loading [observable]="lolApi.getChampions()">
        <lb-champion *ngFor="let champion of champions
                            | toArray
                            | fuzzyBy:'name':name
                            | lbSort:sort
                            | lbTags:tags"
                    [champion]="champion">
        </lb-champion>
      </lb-loading>
    </div>`
})

export class ChampionsComponent implements OnInit {
  champions: Array<any> = [];

  tags: Array<string> = [];
  name: string;
  sort = '';

  @ViewChildren(ChampionComponent) activeChampions: QueryList<ChampionComponent>;

  constructor(private route: ActivatedRoute, private router: Router, public lolApi: LolApiService) {
  }

  ngOnInit() {
    this.lolApi.getChampions().subscribe(champions => this.champions = champions.data);
  }

  enterHit() {
    if (this.activeChampions && this.activeChampions.length === 1) {
      this.router.navigate([this.activeChampions.first.champion.key], {relativeTo: this.route});
    }
  }
}
