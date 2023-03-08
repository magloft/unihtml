import { Element as BaseElement, Properties as BasePropeties } from 'hast'

export type Properties = BasePropeties & { className?: string[] }

export interface Element extends BaseElement {
  properties?: Properties
}
