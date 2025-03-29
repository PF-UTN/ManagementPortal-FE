import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TableComponent } from './table.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('TableComponent', () => {
  let component: TableComponent<{ name: string }>;
  let fixture: ComponentFixture<TableComponent<{ name: string }>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent, BrowserAnimationsModule, MatTableModule, MatPaginatorModule],
      providers: [MatPaginatorIntl]
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent<{ name: string }>);
    component = fixture.componentInstance;

    component.columns = [
      { columnDef: 'name', header: 'Name', type: 'value', value: (row) => row.name },
      { columnDef: 'action', header: 'Action', type: 'action', value: () => 'Click', action: () => {} }
    ];
    component.dataSource = of([{ name: 'Test Name' }]);
    component.itemsNumber = 1;
    component.pageIndex = 0;
    component.pageSize = 10;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render table headers correctly', () => {
    const headers = fixture.debugElement.queryAll(By.css('th'));
    expect(headers.length).toBe(2);
    expect(headers[0].nativeElement.textContent.trim()).toBe('Name');
    expect(headers[1].nativeElement.textContent.trim()).toBe('Action');
  });

  it('should execute the action when onActionClick is called', () => {
    const mockAction = jest.fn(); 
    const row = { name: 'Test Name' }; 
    component.onActionClick('edit', row); 
    expect(mockAction).not.toHaveBeenCalled(); 
  });

  it('should update pageIndex and pageSize on pagination change', () => {
    jest.spyOn(component.pageChange, 'emit');
    const pageEvent = { pageIndex: 1, pageSize: 20, length: 10 } as PageEvent;
    component.onPageChange(pageEvent);
    expect(component.pageChange.emit).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 20 });
  });
});