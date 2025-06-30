import { LateralDrawerService } from '@Common-UI';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';

import { CreateUpdateProductCategoryLateralDrawerComponent } from './create-update-product-category-lateral-drawer.component';
import { ProductCategoryService } from '../../services/product-category.service';
import {
  mockNewProductCategory,
  mockProductCategory,
} from '../../testing/mock-data.model';

describe('CreateUpdateProductCategoryLateralDrawerComponent', () => {
  let component: CreateUpdateProductCategoryLateralDrawerComponent;
  let fixture: ComponentFixture<CreateUpdateProductCategoryLateralDrawerComponent>;

  const mockProductCategoryService = mockDeep<ProductCategoryService>();
  mockProductCategoryService.getCategoriesAsync.mockReturnValue(of([]));
  let lateralDrawerService: LateralDrawerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateUpdateProductCategoryLateralDrawerComponent,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: ProductCategoryService,
          useValue: mockProductCategoryService,
        },
        {
          provide: LateralDrawerService,
          useValue: mockDeep<LateralDrawerService>(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      CreateUpdateProductCategoryLateralDrawerComponent,
    );
    component = fixture.componentInstance;
    fixture.detectChanges();

    lateralDrawerService = TestBed.inject(LateralDrawerService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('should initialize the form', () => {
      // Arrange
      // Act
      // Assert
      expect(component.productCategoryForm.valid).toBeFalsy();
    });

    it('should initialize categories on ngOnInit', () => {
      //Arrange
      jest
        .spyOn(mockProductCategoryService, 'getCategoriesAsync')
        .mockReturnValue(of([mockProductCategory]));
      //Act
      component.ngOnInit();
      //Assert
      expect(mockProductCategoryService.getCategoriesAsync).toHaveBeenCalled();
    });
    it('should set enable false for the description field', () => {
      // Arrange
      // Act
      // Assert
      expect(
        component.productCategoryForm.controls.description.enabled,
      ).toBeFalsy();
    });
  });
  describe('onSubmit', () => {
    it('should not submit if the form is invalid', () => {
      // Arrange
      component.productCategoryForm.controls.name.setValue(null);
      // Act
      component.onSubmit();
      // Assert
      expect(
        mockProductCategoryService.postCreateOrUpdateProductCategoryAsync,
      ).not.toHaveBeenCalled();
    });
    it('should submit the form if valid when is creating a new category', () => {
      // Arrange
      component.isCreating.set(true);
      component.productCategoryForm.controls.name.setValue(
        mockNewProductCategory.name,
      );
      component.productCategoryForm.controls.description.setValue(
        mockNewProductCategory.description,
      );
      jest
        .spyOn(
          mockProductCategoryService,
          'postCreateOrUpdateProductCategoryAsync',
        )
        .mockReturnValue(of(mockProductCategory));

      // Act
      component.onSubmit();

      // Assert
      expect(
        mockProductCategoryService.postCreateOrUpdateProductCategoryAsync,
      ).toHaveBeenCalledWith(mockNewProductCategory);
    });
    it('should submit the form if valid when updating a category', () => {
      // Arrange
      const event = {
        option: { value: mockProductCategory },
      } as unknown as MatAutocompleteSelectedEvent;
      component.isCreating.set(false);
      component.isUpdating.set(true);
      component.id = mockProductCategory.id;
      jest
        .spyOn(
          mockProductCategoryService,
          'postCreateOrUpdateProductCategoryAsync',
        )
        .mockReturnValue(of(mockProductCategory));

      // Act
      component.onCategorySelected(event);
      component.onSubmit();

      // Assert
      expect(
        mockProductCategoryService.postCreateOrUpdateProductCategoryAsync,
      ).toHaveBeenCalledWith(mockProductCategory);
    });
  });
  it('should close the drawer after submitting', () => {
    // Arrange
    component.isCreating.set(true);
    component.productCategoryForm.controls.name.setValue(
      mockNewProductCategory.name,
    );
    component.productCategoryForm.controls.description.setValue(
      mockNewProductCategory.description,
    );
    jest
      .spyOn(
        mockProductCategoryService,
        'postCreateOrUpdateProductCategoryAsync',
      )
      .mockReturnValue(of(mockProductCategory));
    jest.spyOn(lateralDrawerService, 'close');

    // Act
    component.onSubmit();

    // Assert
    expect(lateralDrawerService.close).toHaveBeenCalled();
  });
  describe('onCategorySelected', () => {
    it('should set isUpdating to true when selecting an existing category', () => {
      // Arrange
      const event = {
        option: { value: mockProductCategory },
      } as unknown as MatAutocompleteSelectedEvent;
      // Act
      component.onCategorySelected(event);
      // Assert
      expect(component.isUpdating()).toBe(true);
    });

    it('should set isCreating to true when selecting NEW_CATEGORY_OPTION', () => {
      // Arrange
      const event = {
        option: { value: component.NEW_CATEGORY_OPTION },
      } as unknown as MatAutocompleteSelectedEvent;
      // Act
      component.onCategorySelected(event);
      // Assert
      expect(component.isCreating()).toBe(true);
    });

    it('should set the form name control value when selecting an existing category', () => {
      // Arrange
      const event = {
        option: { value: mockProductCategory },
      } as unknown as MatAutocompleteSelectedEvent;
      // Act
      component.onCategorySelected(event);
      // Assert
      expect(component.productCategoryForm.controls.name.value).toEqual(
        mockProductCategory,
      );
    });

    it('should reset the form name control value when selecting NEW_CATEGORY_OPTION', () => {
      // Arrange
      const event = {
        option: { value: component.NEW_CATEGORY_OPTION },
      } as unknown as MatAutocompleteSelectedEvent;

      // Act
      component.onCategorySelected(event);

      // Assert
      expect(component.productCategoryForm.controls.name.value).toBeNull();
    });
    it('should patch form values when selecting an existing category', () => {
      // Arrange
      const event = {
        option: { value: mockProductCategory },
      } as unknown as MatAutocompleteSelectedEvent;

      // Act
      component.onCategorySelected(event);

      // Assert
      expect(component.id).toEqual(mockProductCategory.id);
      expect(component.productCategoryForm.controls.name.value).toEqual(
        mockProductCategory,
      );
      expect(component.productCategoryForm.controls.description.value).toBe(
        mockProductCategory.description,
      );
    });
  });
  describe('name control invalidCategory error', () => {
    it('should set invalidCategory error when name does not match any category and not creating', () => {
      // Arrange
      component.isCreating.set(false);
      component.categories = [mockProductCategory];
      component.productCategoryForm.controls.name.setValue(
        'Nonexistent Category',
      );
      component.productCategoryForm.controls.name.updateValueAndValidity();

      // Act
      const hasInvalidCategoryError =
        component.productCategoryForm.controls.name.hasError('invalidCategory');

      // Assert
      expect(hasInvalidCategoryError).toBe(true);
    });

    it('should not set invalidCategory error when is creating', () => {
      // Arrange
      component.isCreating.set(true);
      component.categories = [mockProductCategory];
      component.productCategoryForm.controls.name.setValue(
        mockProductCategory.name,
      );
      component.productCategoryForm.controls.name.updateValueAndValidity();
      // Act
      const hasInvalidCategoryError =
        component.productCategoryForm.controls.name.hasError('invalidCategory');

      // Assert
      expect(hasInvalidCategoryError).toBe(false);
    });
  });
});
