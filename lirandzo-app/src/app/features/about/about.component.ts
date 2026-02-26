import { Component, AfterViewInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisionMissionValuesComponent } from '../home/vision-mission-values/vision-mission-values.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, VisionMissionValuesComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements AfterViewInit {
  private el = inject(ElementRef);

  ngAfterViewInit(): void {
    const videos = this.el.nativeElement.querySelectorAll('video');
    videos.forEach((v: HTMLVideoElement) => {
      v.muted = true;
    });
  }
}
