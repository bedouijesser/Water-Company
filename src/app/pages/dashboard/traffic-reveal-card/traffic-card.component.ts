import { Component } from '@angular/core';
import { TrafficList } from '../../../@core/data/traffic-list';

@Component({
  selector: 'ngx-traffic-reveal-card',
  styleUrls: ['./traffic-card.component.scss'],
  templateUrl: './traffic-card.component.html',
})
export class TrafficCardComponent {
  trafficList = [
    {'id': 0, 'day': 'Mon', 'sold': 456},
    {'id': 1, 'day': 'Tue', 'sold': 531},
    {'id': 2, 'day': 'Wen', 'sold': 356},
    {'id': 3, 'day': 'Thu', 'sold': 600},
    {'id': 4, 'day': 'Fri', 'sold': 566},
    {'id': 5, 'day': 'Sat', 'sold': 456},
    {'id': 6, 'day': 'Sun', 'sold': 550},
  ];
  private alive = true;

  trafficListData: TrafficList;
  revealed = false;
  compareEntry(entry) {
    if (entry.day === 'Mon') return '15.56';
    return (((entry.sold - this.trafficList[entry.id - 1].sold) / entry.sold) * 100).toFixed(2);
  }



}
