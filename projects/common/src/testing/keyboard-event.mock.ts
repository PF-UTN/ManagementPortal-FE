export const KeyboardEventMock = (key: string): KeyboardEvent =>
  ({
    key: key,
    preventDefault: jest.fn(),
  }) as unknown as KeyboardEvent;
