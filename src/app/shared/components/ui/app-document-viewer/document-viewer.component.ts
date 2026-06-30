import { Component, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [CommonModule, DialogModule],
  template: `
    <p-dialog [modal]="true" [(visible)]="visible" (visibleChange)="onVisibleChange($event)" [style]="{ width: '80vw', height: '80vh' }" [maximizable]="true" appendTo="body">
      
      <ng-template pTemplate="header">
        <div class="d-flex align-items-center w-100">
          <span class="p-dialog-title flex-grow-1">Document Viewer</span>
          @if (documentType() === 'image') {
            <div class="d-flex gap-2 me-4">
              <button class="btn btn-sm btn-outline-secondary" (click)="zoomOut()" title="Zoom Out"><i class="pi pi-search-minus"></i></button>
              <button class="btn btn-sm btn-outline-secondary" (click)="zoomReset()" title="Reset Zoom"><i class="pi pi-refresh"></i></button>
              <button class="btn btn-sm btn-outline-secondary" (click)="zoomIn()" title="Zoom In"><i class="pi pi-search-plus"></i></button>
            </div>
          }
        </div>
      </ng-template>

      <div class="h-100 w-100 bg-light p-2" style="overflow: auto; display: flex; justify-content: center; align-items: flex-start;">
        @if (safeUrl()) {
          @if (documentType() === 'pdf') {
            <object [data]="safeUrl()" type="application/pdf" width="100%" height="100%">
              <iframe [src]="safeUrl()" width="100%" height="100%" style="border: none;">
                <p>Your browser does not support viewing this document. <a [href]="safeUrl()" target="_blank">Download it here</a>.</p>
              </iframe>
            </object>
          } @else {
            <img [src]="safeUrl()" 
                 [style.width.%]="100 * zoomLevel()" 
                 style="height: auto; max-width: none; transition: width 0.2s ease; display: block; margin: auto;" />
          }
        }
      </div>
    </p-dialog>
  `
})
export class AppDocumentViewerComponent implements OnChanges {
  @Input() visible = false;
  @Input() documentPath = '';
  @Output() visibleChange = new EventEmitter<boolean>();

  safeUrl = signal<SafeResourceUrl | null>(null);
  documentType = signal<'pdf' | 'image'>('image');
  zoomLevel = signal(1);

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documentPath'] && this.documentPath) {
      this.processPath(this.documentPath);
    }
  }

  private processPath(path: string): void {
    const isPdf = path.toLowerCase().endsWith('.pdf');
    this.documentType.set(isPdf ? 'pdf' : 'image');
    this.zoomLevel.set(1);

    if (path.startsWith('http://') || path.startsWith('https://')) {
      this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(path));
    } else {
      const baseUrl = environment.apiUrl.replace('/api', '');
      const cleanPath = path.startsWith('/') ? path : '/' + path;
      this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(baseUrl + cleanPath));
    }
  }

  onVisibleChange(val: boolean) {
    this.visible = val;
    this.visibleChange.emit(val);
  }

  zoomIn() {
    this.zoomLevel.update(z => Math.min(z + 0.5, 5));
  }

  zoomOut() {
    this.zoomLevel.update(z => Math.max(z - 0.5, 0.5));
  }

  zoomReset() {
    this.zoomLevel.set(1);
  }
}
