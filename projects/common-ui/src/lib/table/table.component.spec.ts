import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TableComponent } from './table.component';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableComponent],
      imports: [BrowserAnimationsModule, MatTableModule, MatPaginatorModule],
      providers: [MatPaginatorIntl]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;

    component.columns = [
      { columnDef: 'name', header: 'Name', type: 'value', value: (row: any) => row.name },
      { columnDef: 'action', header: 'Action', type: 'action', value: () => 'Click', action: () => {} }
    ];
    component.dataSource = [{ name: 'Test Name' }];
    component.itemsNumber = component.dataSource.length;
    component.pageIndex = 0;
    component.pageSize = 0;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the table component', () => {
    expect(component).toBeTruthy();
  });
  
  it('should render table headers correctly', () => {
    const headers = fixture.debugElement.queryAll(By.css('th'));
    expect(headers.length).toBe(2); 
    expect(headers[0].nativeElement.textContent.trim()).toBe('Name');
    expect(headers[1].nativeElement.textContent.trim()).toBe('Action');
  });

  it('should render rows with correct data', () => {
    const rows = fixture.debugElement.queryAll(By.css('td'));
    expect(rows.length).toBe(2); 
    expect(rows[0].nativeElement.textContent.trim()).toBe('Test Name');
    expect(rows[1].nativeElement.textContent.trim()).toBe('Click');
  });

  it('should call onActionClick when action button is clicked', () => {
    jest.spyOn(component, 'onActionClick');
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);
    expect(component.onActionClick).toHaveBeenCalled();
  });

  it('should update pageIndex and pageSize on pagination change', () => {
    jest.spyOn(component.pageChange, 'emit');
    const pageEvent = { pageIndex: 1, pageSize: 20, length: 10 } as any;
    component.onPageChange(pageEvent);
    expect(component.pageChange.emit).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 20 });
  });

  it('should assign paginator to dataSource after view init', () => {
    component.paginator = TestBed.createComponent(MatPaginator).componentInstance;
    component.ngAfterViewInit();
    expect(component.tableDataSource.paginator).toBe(component.paginator);
  });

  it('should call goToFirstPage and reset paginator', () => {
    component.paginator = TestBed.createComponent(MatPaginator).componentInstance;
    jest.spyOn(component.paginator, 'firstPage');
    component.goToFirstPage();
    expect(component.paginator.firstPage).toHaveBeenCalled();
  });
});

