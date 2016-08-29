import {NgClass, NgFor} from '@angular/common';
import {AfterContentChecked, ChangeDetectionStrategy, Component, ElementRef, Inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {select} from 'd3-selection';
import {Line, line} from 'd3-shape';

import {settings} from '../../../../config/settings';
import {BuildService} from '../build.service';
import {Item} from '../item';
import {Samples} from '../samples';

import {AbilitySequenceComponent} from './ability-sequence.component';
import {DataAxis, LevelAxisLine, LevelAxisText, TimeAxis} from './axes';
import {config} from './config';
import {LegendComponent} from './legend.component';
import {DataScale, LevelScale, TimeScale} from './scales';

export interface Path {
  enabled: boolean;
  preview: boolean;
  name: string;
  obj: Line<[number, number]>;
}

@Component({
  selector: 'graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  directives: [LegendComponent, AbilitySequenceComponent, NgFor, NgClass],
  template: `
    <legend [paths]="paths"></legend>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" [attr.viewBox]="'0 0 ' +  config.width + ' ' + config.height">
      <g ability-sequence [champion]="champion" [attr.transform]="'translate(0,' + (config.graphHeight + config.margin.top + config.margin.bottom) + ')'"></g>
      <g [attr.transform]="'translate(' + config.margin.left + ',' + config.margin.top + ')'">
        <g class="lines">
          <path *ngFor="let path of paths" [ngClass]="'line ' + path.name + (path.enabled ? ' enabled' : '') + (path.preview ? ' preview' : '')"></path>
        </g>
        <g class="axes">
          <g class="x axis time" [attr.transform]="'translate(0,' + config.graphHeight + ')'"></g>
          <g class="x axis level-line" [attr.transform]="'translate(0,' + (config.height - config.margin.top - config.margin.bottom) + ')'"></g>
          <g class="x axis level-text" [attr.transform]="'translate(0,' + (config.height - config.margin.top - config.margin.bottom) + ')'"></g>
          <g class="y axis"></g>
        </g>
      </g>
    </svg>`
})

export class GraphComponent implements OnChanges, OnInit, AfterContentChecked {
  @Input() private samples: Samples;
  @Input() private stats: any;
  @Input() private champion: any;

  private config = config;

  private svg: any;

  private xScaleTime = new TimeScale();
  private xScaleLevel = new LevelScale();
  private yScale = new DataScale();

  private xAxisTime = new TimeAxis();
  private xAxisLevelLine = new LevelAxisLine();
  private xAxisLevelText = new LevelAxisText();
  private yAxis = new DataAxis();

  private paths = new Array<Path>();

  private lineSamples: any =
      line()
          .x((d, i) => {
            return this.xScaleTime.get()(
                i * (settings.gameTime / (settings.matchServer.sampleSize - 1)));
          })
          .y((d) => {
            return this.yScale.get()(d);
          });

  private lineStats: any = line()
                               .x((d) => {
                                 return this.xScaleTime.get()(d['time']);
                               })
                               .y((d) => {
                                 return this.yScale.get()(d['value']);
                               });

  constructor(
      @Inject(ElementRef) private elementRef: ElementRef, private buildService: BuildService) {
    buildService.pickedItems.subscribe(this.calculate);
  }

  ngOnInit() {
    this.svg = select(this.elementRef.nativeElement).select('svg');
    this.createAxes();
  }

  ngAfterContentChecked() {
    this.updatePaths();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.svg) {
      this.createPaths();
      this.createLevelScale();
    }
  }

  createAxes() {
    this.xScaleTime.create();
    this.xAxisTime.create(this.xScaleTime);

    this.yScale.create();
    this.yAxis.create(this.yScale);

    this.svg.select('.x.axis.time').call(this.xAxisTime.get());
    this.svg.select('.y.axis').call(this.yAxis.get());
  }

  createPaths() {
    this.paths = [];
    for (let index in this.samples) {
      this.paths.push(
          {enabled: true, preview: false, name: index, obj: this.lineSamples(this.samples[index])});
    }
    for (let index in this.stats) {
      this.paths.push(
          {enabled: true, preview: false, name: index, obj: this.lineStats(this.stats[index])});
    }
  }

  updatePaths() {
    for (let path of this.paths) {
      this.svg.select('.line.' + path.name).attr('d', path.obj);
    }
  }

  createLevelScale() {
    if (!this.samples.xp.length) {
      return;
    }

    this.xScaleLevel.create();
    this.xScaleLevel.update(this.samples);

    this.xAxisLevelLine.create(this.xScaleLevel);
    this.xAxisLevelText.create(this.xScaleLevel);

    this.xAxisLevelText.update(this.samples);

    this.svg.select('.x.axis.level-line').call(this.xAxisLevelLine.get());
    this.svg.select('.x.axis.level-text').call(this.xAxisLevelText.get());

    for (let i = 1; i <= 4; i++) {
      this.svg.selectAll('.x.axis.level-text .tick')
          .append('foreignObject')
          .attr('y', -23 - (50 * (i - 1)) - (i >= 2 ? 5 : 0) - this.config.margin.bottom)
          .attr('x', -10)
          .append('xhtml:label')
          .append('xhtml:input')
          .attr('type', 'checkbox');
    }
  }

  private calculate = (pickedItems: Array<Item>) => {
    this.stats = {};
    pickedItems.forEach((item: Item) => {
      for (let index in item.stats) {
        let stat = item.stats[index];
        if (!this.stats[index]) {
          this.stats[index] = [];
          this.stats[index][0] = {time: 0, value: 0};
        }
        this.stats[index].push({time: item.time, value: stat});
      }
    });
    this.createPaths();
  }
}
