import { Injectable } from '@angular/core';
import { Item } from '@models/command.model';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class CommandService {
  activeItems: { [key: number]: boolean } = {};

  constructor(private alertService: AlertService) { }

  copy(item: Item, index: number) {
    navigator.clipboard.writeText(item.command).then(() => {

      this.activeItems[index] = true;
      this.showCopiedBanner();

      setTimeout(() => {
        this.activeItems[index] = false;
      }, 1000);
    }).catch(err => { throw err });
  }

  showCopiedBanner() {
    this.alertService.showAlert('Copied!', 'info');
  }

}
