import { ComponentRef, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDrawer } from '@angular/material/sidenav';
import { mockDeep } from 'jest-mock-extended';

import { LateralDrawerService } from './lateral-drawer.service';
import { LateralDrawerComponent } from '../lateral-drawer.component';
import { LateralDrawerConfig } from '../model';

class DummyComponent {
  foo = 'bar';
}

describe('LateralDrawerService', () => {
  let service: LateralDrawerService;
  let drawerComponent: MatDrawer;
  let container: ViewContainerRef;
  let componentRef: ComponentRef<DummyComponent>;
  let config: LateralDrawerConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LateralDrawerService],
    });

    service = TestBed.inject(LateralDrawerService);

    drawerComponent = mockDeep<MatDrawer>();
    container = mockDeep<ViewContainerRef>();
    componentRef = mockDeep<ComponentRef<DummyComponent>>();
    config = {
      title: 'Test Drawer',
      footer: {
        firstButton: {
          text: 'Close',
          click: jest.fn(),
        },
      },
    };
  });

  describe('open', () => {
    const testData = { foo: 'baz' };

    it('should throw if drawer or container is not set', () => {
      // Arrange & Act & Assert
      expect(() => service.open(DummyComponent)).toThrow(
        'Drawer or container is not set. Ensure LateralDrawerComponent is initialized.',
      );
    });
    it('should clear the container', () => {
      // Arrange
      service.setDrawer(drawerComponent, container);
      jest.spyOn(container, 'createComponent').mockReturnValue(componentRef);
      jest.spyOn(container.injector, 'get').mockReturnValue(drawerComponent);

      // Act
      service.open(DummyComponent, testData, config);

      // Assert
      expect(container.clear).toHaveBeenCalled();
    });

    it('should create the component in the container', () => {
      // Arrange
      service.setDrawer(drawerComponent, container);
      jest.spyOn(container, 'createComponent').mockReturnValue(componentRef);
      jest.spyOn(container.injector, 'get').mockReturnValue(drawerComponent);

      // Act
      service.open(DummyComponent, testData, config);

      // Assert
      expect(container.createComponent).toHaveBeenCalledWith(DummyComponent);
    });

    it('should assign data to the created component', () => {
      // Arrange
      service.setDrawer(drawerComponent, container);
      jest.spyOn(container, 'createComponent').mockReturnValue(componentRef);
      jest.spyOn(container.injector, 'get').mockReturnValue(drawerComponent);
      const assignSpy = jest.spyOn(Object, 'assign');

      // Act
      service.open(DummyComponent, testData, config);

      // Assert
      expect(assignSpy).toHaveBeenCalledWith(componentRef.instance, testData);
    });

    it('should set the config on the drawer component', () => {
      // Arrange
      const drawerMock = mockDeep<LateralDrawerComponent>();
      service.setDrawer(drawerComponent, container);
      jest.spyOn(container, 'createComponent').mockReturnValue(componentRef);
      jest.spyOn(container.injector, 'get').mockReturnValue(drawerMock);

      // Act
      service.open(DummyComponent, testData, config);

      // Assert
      expect(drawerMock.config).toBe(config);
    });

    it('should open the drawer', () => {
      // Arrange
      service.setDrawer(drawerComponent, container);
      jest.spyOn(container, 'createComponent').mockReturnValue(componentRef);
      jest.spyOn(container.injector, 'get').mockReturnValue(drawerComponent);

      // Act
      service.open(DummyComponent, testData, config);

      // Assert
      expect(drawerComponent.open).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should call drawer.close if drawer is set', () => {
      // Arrange
      service.setDrawer(drawerComponent, container);

      // Act
      service.close();

      // Assert
      expect(drawerComponent.close).toHaveBeenCalled();
    });

    it('should not throw if drawer is not set', () => {
      // Arrange

      // Act & Assert
      expect(() => service.close()).not.toThrow();
    });
  });
});
