import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material';

interface ISection {
  title: string;
  link: string;
}
interface IMarix {
  title: string;
  link: string;
  id: string;
}

interface INav {
  root: ISection;
  sections: ISection[];
}

interface INavMatrix {
  root: IMarix;
  sections: IMarix[];
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isCollapsedW = false;
  isCollapsedP = false;
  isCollapsedH = false;
  nav: INav = {
    root: { title: 'General server', link: 'user' },
    sections: [
      { title: 'Markets', link: 'user' },
      { title: 'Trades', link: 'trades' },
      { title: 'Export', link: 'export' },
      { title: 'Order', link: 'order' },
      { title: 'Rate', link: 'rate' },
      { title: 'Arbitrage', link: 'arbitrage' },
      { title: 'Current Arbitrage', link: 'current-arbitrage' },
      { title: 'Percent', link: 'percent' },
      { title: 'Statistic', link: 'statistic' },
      { title: 'Matrix', link: 'matrix' }
    ]
  };
  navMatrix: INavMatrix = {
    root: { title: 'General server', link: 'user', id: 'dyd87687t' },
    sections: [
      { title: 'Matrix1', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix2', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix3', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix4', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix5', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix6', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix7', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix8', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix9', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix10', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix11', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix12', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix13', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix14', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix15', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix16', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix17', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix18', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix19', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix20', link: 'matrix', id: 'dyd87687t' },
      { title: 'Matrix21', link: 'matrix', id: 'dyd87687t' }
    ]
  };

  constructor() { }

  ngOnInit() {
  }
}
