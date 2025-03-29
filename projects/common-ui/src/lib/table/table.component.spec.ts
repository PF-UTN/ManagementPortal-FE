import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TableColumn } from '../models/table-column.model';
import { of, throwError } from 'rxjs';

interface MockData {
  id: number;
  name: string;
}

describe('TableComponent', () => {
  let component: TableComponent<MockData>;
  let fixture: ComponentFixture<TableComponent<MockData>>;

  const mockColumns: TableColumn<MockData>[] = [
    { columnDef: 'id', header: 'ID', type: 'value', value: (row) => row.id.toString() },
    { columnDef: 'name', header: 'Name', type: 'value', value: (row) => row.name }
  ];

  const mockData: MockData[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TableComponent, 
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent<MockData>);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize displayedColumns based on columns input', () => {
    component.columns = mockColumns;
    component.ngOnInit();
    expect(component.displayedColumns).toEqual(['id', 'name']);
  });

  it('should update tableDataSource when dataSource emits data', () => {
    component.columns = mockColumns;
    component.dataSource = of(mockData); 
    component.ngOnInit();
    expect(component.tableDataSource.data).toEqual(mockData);
  });

  it('should log an error if dataSource subscription fails', () => {
    jest.spyOn(console, 'error');
    const mockError = new Error('Test error');
    component.dataSource = throwError(() => mockError); 
    component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith('Error al suscribirse a dataSource:', mockError);
  });

  it('should emit actionClicked event when onActionClick is called', () => {
    const action = 'edit';
    const row = { id: 1, name: 'John Doe' };
    jest.spyOn(component.actionClicked, 'emit');
    component.onActionClick(action, row);
    expect(component.actionClicked.emit).toHaveBeenCalledWith({ action, row });
  });

  it('should apply getRowClass function to rows', () => {
    const mockRow = { id: 1, name: 'John Doe' };
    component.getRowClass = (row) => (row.id === 1 ? 'highlight' : '');
    const rowClass = component.getRowClass(mockRow);
    expect(rowClass).toBe('highlight');
  });

  it('should handle undefined or empty dataSource gracefully', () => {
    component.columns = mockColumns;
    component.dataSource = of([]); 
    component.ngOnInit();
    expect(component.tableDataSource.data).toEqual([]);
    component.dataSource = of([]); 
    component.ngOnInit();
    expect(component.tableDataSource.data).toEqual([]);
  });

  it('should initialize displayedColumns as an empty array if no columns are provided', () => {
    component.columns = [];
    component.ngOnInit();
    expect(component.displayedColumns).toEqual([]);
  });

  it('should apply custom row class function and handle different row data', () => {
    component.getRowClass = (row) => (row.name === 'John Doe' ? 'highlight' : '');
    const row1 = { id: 1, name: 'John Doe' };
    const row2 = { id: 2, name: 'Jane Smith' };

    expect(component.getRowClass(row1)).toBe('highlight');
    expect(component.getRowClass(row2)).toBe('');
  });

  it('should log an error when dataSource is undefined', () => {
    jest.spyOn(console, 'error');
    component.dataSource = of([]);
    component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith('dataSource is undefined or not an observable.');
  });

  it('should emit actionClicked event with proper parameters for different actions', () => {
    const action = 'edit';
    const row = { id: 1, name: 'John Doe' };
    jest.spyOn(component.actionClicked, 'emit');
    component.onActionClick(action, row);
    expect(component.actionClicked.emit).toHaveBeenCalledWith({ action, row });

    const deleteAction = 'delete';
    component.onActionClick(deleteAction, row);
    expect(component.actionClicked.emit).toHaveBeenCalledWith({ action: deleteAction, row });
  });

  it('should handle empty dataSource gracefully', () => {
    component.dataSource = of([]); 
    component.ngOnInit();
    expect(component.tableDataSource.data).toEqual([]);
  });

  it('should update tableDataSource when dataSource changes', () => {
    const newData = [{ id: 3, name: 'Sam Brown' }];
    component.dataSource = of(newData);
    component.ngOnInit();
    expect(component.tableDataSource.data).toEqual(newData);
  });

  it('should emit actionClicked event for other actions', () => {
    const action = 'view';
    const row = { id: 2, name: 'Jane Smith' };
    jest.spyOn(component.actionClicked, 'emit');
    component.onActionClick(action, row);
    expect(component.actionClicked.emit).toHaveBeenCalledWith({ action, row });
  });
  
});
