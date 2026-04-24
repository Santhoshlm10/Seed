import { Parameter } from './Playground';

export type SelectorType = 'css' | 'id' | 'name' | 'xpath' | 'data-attr';

export interface FormFieldMapping {
  id: string;
  label: string;
  selectorType: SelectorType;
  selectorValue: string;
  parameter: Parameter | null;
}

export interface FormDefinition {
  name: string;
  mappings: FormFieldMapping[];
}

export const SELECTOR_TYPE_LABELS: Record<SelectorType, string> = {

  id: 'ID',
  css: 'CSS Selector',
  name: 'Name',
  xpath: 'XPath',
  'data-attr': 'Data Attribute',
};

export const SELECTOR_TYPE_PLACEHOLDERS: Record<SelectorType, string> = {
  css: '.my-input or #email',
  id: 'email',
  name: 'email',
  xpath: '//input[@id="email"]',
  'data-attr': 'data-testid=email',
};
