import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  input,
  signal,
  OnDestroy,
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

    const isVerticallyTruncated = el.scrollHeight > el.clientHeight;
    const isHorizontallyTruncated = el.scrollWidth > el.clientWidth;

    this.isTruncated.set(isVerticallyTruncated || isHorizontallyTruncated);
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
