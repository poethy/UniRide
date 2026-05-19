import { Component, OnInit } from '@angular/core';
import { UiStateService } from '../core/services/ui-state.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  standalone: false,
})
export class LayoutComponent implements OnInit {
  sidebarOpen = false;

  constructor(private ui: UiStateService) {}

  ngOnInit(): void {
    this.ui.sidebarOpen$.subscribe(v => this.sidebarOpen = v);
  }

  closeSidebar(): void { this.ui.close(); }
}
