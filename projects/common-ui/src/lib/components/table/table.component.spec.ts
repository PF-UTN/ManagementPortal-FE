import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { of } from 'rxjs';

import { TableComponent } from './table.component';
import { ColumnTypeEnum } from '../../constants';
import { TableColumn } from '../../models/table-column.model';
import { PillComponent } from '../pill';

interface MockData {
  id: number;
  name: string;
}

describe('TableComponent', () => {
  let component: TableComponent<MockData>;
  let fixture: ComponentFixture<TableComponent<MockData>>;

  const mockColumns: TableColumn<MockData>[] = [
    {
      columnDef: 'id',
      header: 'ID',
      type: ColumnTypeEnum.VALUE,
      value: (row) => row.id.toString(),
    },
    {
      columnDef: 'name',
      header: 'Name',
      type: ColumnTypeEnum.VALUE,
      value: (row) => row.name,
    },
  ];

  const mockData: MockData[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TableComponent,
        PillComponent,
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent<MockData>);
    component = fixture.componentInstance;
    component.dataSource$ = of(mockData);
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      // Arrange
      // (No preparación necesaria)

      // Act
      const isComponentCreated = component;

      // Assert
      expect(isComponentCreated).toBeTruthy();
    });

    it('should initialize displayedColumns based on columns input', () => {
      // Arrange
      component.columns = mockColumns;
      component.dataSource$ = of(mockData);

      // Act
      component.ngOnInit();

      // Assert
      expect(component.displayedColumns).toEqual(['id', 'name']);
    });

    it('should initialize displayedColumns as an empty array if no columns are provided', () => {
      // Arrange
      component.columns = [];

      // Act
      component.ngOnInit();

      // Assert
      expect(component.displayedColumns).toEqual([]);
    });
  });

  describe('DataSource', () => {
    it('should update tableDataSource when dataSource emits data', () => {
      // Arrange
      component.columns = mockColumns;
      component.dataSource$ = of(mockData);

      // Act
      component.ngOnInit();

      // Assert
      expect(component.tableDataSource.data).toEqual(mockData);
    });

    it('should handle undefined or empty dataSource gracefully', () => {
      // Arrange
      component.columns = mockColumns;
      component.dataSource$ = of([]);

      // Act
      component.ngOnInit();

      // Assert
      expect(component.tableDataSource.data).toEqual([]);
    });

    it('should update tableDataSource when dataSource changes', () => {
      // Arrange
      const newData = [{ id: 3, name: 'Sam Brown' }];
      component.dataSource$ = of(newData);

      // Act
      component.ngOnInit();

      // Assert
      expect(component.tableDataSource.data).toEqual(newData);
    });
  });

  describe('Row Classes', () => {
    it('should apply getRowClass function to rows', () => {
      // Arrange
      const mockRow = { id: 1, name: 'John Doe' };
      component.getRowClass = (row) => (row.id === 1 ? 'highlight' : '');

      // Act
      const rowClass = component.getRowClass(mockRow);

      // Assert
      expect(rowClass).toBe('highlight');
    });

    it('should apply custom row class function and handle different row data', () => {
      // Arrange
      component.getRowClass = (row) =>
        row.name === 'John Doe' ? 'highlight' : '';
      const row1 = { id: 1, name: 'John Doe' };
      const row2 = { id: 2, name: 'Jane Smith' };

      // Act
      const rowClass1 = component.getRowClass(row1);
      const rowClass2 = component.getRowClass(row2);

      // Assert
      expect(rowClass1).toBe('highlight');
      expect(rowClass2).toBe('');
    });
  });

  describe('Actions', () => {
    it('should emit actionClicked event when onActionClick is called', () => {
      // Arrange
      const action = 'edit';
      const row = { id: 1, name: 'John Doe' };
      jest.spyOn(component.actionClicked, 'emit');

      // Act
      component.onActionClick(action, row);

      // Assert
      expect(component.actionClicked.emit).toHaveBeenCalledWith({
        action,
        row,
      });
    });

    it('should emit actionClicked event for other actions', () => {
      // Arrange
      const action = 'view';
      const row = { id: 2, name: 'Jane Smith' };
      jest.spyOn(component.actionClicked, 'emit');

      // Act
      component.onActionClick(action, row);

      // Assert
      expect(component.actionClicked.emit).toHaveBeenCalledWith({
        action,
        row,
      });
    });
  });
});
