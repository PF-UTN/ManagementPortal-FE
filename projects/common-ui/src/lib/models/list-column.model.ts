import { TemplateRef } from '@angular/core';

export interface ListColumn<T> {
  key: string;
  header: string;
  value?: (item: T) => string;
  bootstrapCol?: string;
  template?: TemplateRef<{ $implicit: T }>;
  actions?: Array<{
    description: string;
    icon?: string;
    action: (item: T) => void;
  }>;
}
