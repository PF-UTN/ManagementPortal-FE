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
});