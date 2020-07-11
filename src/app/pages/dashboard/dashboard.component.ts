import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  trafficList = [
    {'id': 0, 'day': 'Mon', 'sold': 456},
    {'id': 1, 'day': 'Tue', 'sold': 531},
    {'id': 2, 'day': 'Wen', 'sold': 356},
    {'id': 3, 'day': 'Thu', 'sold': 600},
    {'id': 4, 'day': 'Fri', 'sold': 566},
    {'id': 5, 'day': 'Sat', 'sold': 456},
    {'id': 6, 'day': 'Sun', 'sold': 550},
  ];
  spList = [
    {'id': 1, 'SP_Name': 'Societé Berrich', 'SP_Accountant_Name': 'Ahmed Berrich'},
    {'id': 2, 'SP_Name': 'Societé Abadllah', 'SP_Accountant_Name': 'Salah Ben Abdallah'},
    {'id': 3, 'SP_Name': 'Societé Gaaloul', 'SP_Accountant_Name': 'Fathi Gaaloul'},
    {'id': 4, 'SP_Name': 'Societé Samir', 'SP_Accountant_Name': 'Yahya Samir'},
  ];

  constructor() {}
  ngOnInit() {
  }

  compareEntry(entry) {
    if (entry.day === 'Mon') return '15.56';
    return (((entry.sold - this.trafficList[entry.id - 1].sold) / entry.sold) * 100).toFixed(2);
  }
  addOrder() {

  }

}
