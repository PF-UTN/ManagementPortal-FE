import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  input,
  signal,
  OnDestroy,
  effect,
} from '@angular/core';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'mp-ellipsis-text',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, MatTooltip],
  templateUrl: './ellipsis-text.component.html',
  styleUrls: ['./ellipsis-text.component.scss'],
})
export class EllipsisTextComponent implements AfterViewInit, OnDestroy {
  text = input<string>('');
  lines = input<number>(1);

  @ViewChild('textContainer', { static: true })
  textContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('tooltip')
  tooltip!: MatTooltip;

  isTruncated = signal(false);
  isHovered = signal(false);

  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      if (this.isTruncated() && this.isHovered()) {
        this.tooltip.show();
      } else {
        this.tooltip.hide();
      }
    });
  }

  ngAfterViewInit(): void {
    const el = this.textContainer.nativeElement;

    this.checkTruncation();

    const parent = el.parentElement;
    if (parent) {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkTruncation();
      });
      this.resizeObserver.observe(parent);
    }
  }

  private checkTruncation() {
    const el = this.textContainer.nativeElement;
    this.isTruncated.set(el.scrollHeight > el.clientHeight);
  }

  onMouseEnter() {
    this.isHovered.set(true);
  }

  onMouseLeave() {
    this.isHovered.set(false);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
