import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ListComponent } from './list.component';
import { ListColumn } from '../../models/list-column.model';

type MockItem = { name: string; age?: number };

describe('ListComponent', () => {
  let fixture: ComponentFixture<ListComponent<MockItem>>;
  let component: ListComponent<MockItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ListComponent<MockItem>);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Arrange & Act
    fixture.detectChanges();
    // Assert
    expect(component).toBeTruthy();
  });

  it('should render headers and rows', () => {
    // Arrange
    component.columns = [
      { key: 'name', header: 'Nombre', value: (i: MockItem) => i.name },
      {
        key: 'age',
        header: 'Edad',
        value: (i: MockItem) => i.age?.toString() ?? '',
      },
    ];
    component.items = [
      { name: 'Juan', age: 30 },
      { name: 'Ana', age: 25 },
    ];
    // Act
    fixture.detectChanges();
    // Assert
    const headers = fixture.nativeElement.querySelectorAll(
      '.mp-list__header span',
    );
    expect(headers.length).toBe(2);
    expect(headers[0].textContent).toContain('Nombre');
    expect(headers[1].textContent).toContain('Edad');

    const rows = fixture.nativeElement.querySelectorAll('.mp-list__row');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Juan');
    expect(rows[1].textContent).toContain('Ana');
  });

  it('should show no data message when items is empty', () => {
    // Arrange
    component.columns = [
      { key: 'name', header: 'Nombre', value: (i: MockItem) => i.name },
    ];
    component.items = [];
    component.noDataMessage = 'Sin datos';
    // Act
    fixture.detectChanges();
    // Assert
    const noData = fixture.nativeElement.querySelector('.mp-list__no-data');
    expect(noData).toBeTruthy();
    expect(noData.textContent).toContain('Sin datos');
  });

  it('should show loading component when isLoading is true', () => {
    // Arrange
    component.isLoading = true;
    // Act
    fixture.detectChanges();
    // Assert
    const loading = fixture.nativeElement.querySelector('mp-loading');
    expect(loading).toBeTruthy();
  });

  it('should render actions and call action handler', () => {
    // Arrange
    const actionMock = jest.fn();
    component.columns = [
      { key: 'name', header: 'Nombre', value: (i: MockItem) => i.name },
      {
        key: 'actions',
        header: '',
        actions: [
          { description: 'Borrar', icon: 'delete', action: actionMock },
        ],
      },
    ];
    component.items = [{ name: 'Juan' }];
    // Act
    fixture.detectChanges();
    const actionBtn = fixture.debugElement.query(
      By.css('.mp-list__actions mat-icon'),
    );
    actionBtn.triggerEventHandler('click');
    // Assert
    expect(actionMock).toHaveBeenCalledWith({ name: 'Juan' });
  });

  it('should render template column', () => {
    // Arrange
    @Component({
      template: `
        <ng-template #custom let-item>
          <span class="custom-cell">{{ item.name }}-custom</span>
        </ng-template>
        <mp-list [columns]="cols" [items]="rows"></mp-list>
      `,
      standalone: true,
      imports: [ListComponent],
    })
    class HostComponent {
      @ViewChild('custom', { static: true }) customTpl!: TemplateRef<{
        $implicit: MockItem;
      }>;
      cols: ListColumn<MockItem>[] = [];
      rows: MockItem[] = [{ name: 'Juan' }];
      ngOnInit() {
        this.cols = [
          { key: 'name', header: 'Nombre', template: this.customTpl },
        ];
      }
    }

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();
    // Assert
    const customCell = hostFixture.nativeElement.querySelector('.custom-cell');
    expect(customCell).toBeTruthy();
    expect(customCell.textContent).toContain('Juan-custom');
  });

  it('should apply bootstrapCol class to cells', () => {
    // Arrange
    component.columns = [
      {
        key: 'name',
        header: 'Nombre',
        value: (i: MockItem) => i.name,
        bootstrapCol: 'col-4',
      },
    ];
    component.items = [{ name: 'Juan' }];

    // Act
    fixture.detectChanges();
    const cell = fixture.nativeElement.querySelector('.mp-list__cell');

    // Assert
    expect(cell.classList).toContain('col-4');
  });

  it('should return true for hasActions if any column has actions', () => {
    // Arrange
    component.columns = [
      { key: 'name', header: 'Nombre', value: (i: MockItem) => i.name },
      {
        key: 'actions',
        header: '',
        actions: [{ description: 'Borrar', icon: 'delete', action: jest.fn() }],
      },
    ];
    // Act & Assert
    expect(component.hasActions).toBe(true);
  });

  it('should return false for hasActions if no column has actions', () => {
    // Arrange
    component.columns = [
      { key: 'name', header: 'Nombre', value: (i: MockItem) => i.name },
    ];
    // Act & Assert
    expect(component.hasActions).toBe(false);
  });

  it('should return the actions column for actionsColumn', () => {
    // Arrange
    const actionsCol = {
      key: 'actions',
      header: '',
      actions: [{ description: 'Borrar', icon: 'delete', action: jest.fn() }],
    };
    component.columns = [
      { key: 'name', header: 'Nombre', value: (i: MockItem) => i.name },
      actionsCol,
    ];
    // Act & Assert
    expect(component.actionsColumn).toBe(actionsCol);
  });

  it('should return undefined for actionsColumn if no column has actions', () => {
    // Arrange
    component.columns = [
      { key: 'name', header: 'Nombre', value: (i: MockItem) => i.name },
    ];
    // Act & Assert
    expect(component.actionsColumn).toBeUndefined();
  });
});
