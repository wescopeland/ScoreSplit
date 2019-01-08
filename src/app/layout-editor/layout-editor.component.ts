import { Component, Input, OnInit } from '@angular/core';

import { Layout, LayoutElement } from '../state/models/layout.model';

@Component({
  selector: 'ss-layout-editor',
  templateUrl: './layout-editor.component.html',
  styleUrls: ['./layout-editor.component.scss']
})
export class LayoutEditorComponent implements OnInit {
  @Input() layout: Layout;

  public selectedElement: number = null;

  constructor() {}

  ngOnInit() {}

  getLayoutElement(element: LayoutElement): string {
    let layoutElement = '';

    if (element === LayoutElement.Bonuses) {
      layoutElement = 'Bonuses';
    }

    if (element === LayoutElement.Deaths) {
      layoutElement = 'Deaths';
    }

    if (element === LayoutElement.ManualInput) {
      layoutElement = 'ManualInput';
    }

    if (element === LayoutElement.Pace) {
      layoutElement = 'Pace';
    }

    if (element === LayoutElement.SplitsList) {
      layoutElement = 'SplitsList';
    }

    if (element === LayoutElement.Title) {
      layoutElement = 'Title';
    }

    if (element === LayoutElement.SumOfBest) {
      layoutElement = 'SumOfBest';
    }

    if (element === LayoutElement.MostRecentSplitValue) {
      layoutElement = 'MostRecentSplitValue';
    }

    return layoutElement;
  }

  selectElement(layoutElement: LayoutElement) {
    this.selectedElement = layoutElement;
    console.log(this.selectedElement);
  }
}
