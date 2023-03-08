import { matches, select, selectAll } from '@magloft/unist-util-select'
import type { Comment, Content, DocType, Element as BaseElement, ElementContent, ElementContentMap, Literal, Node, Parent, Properties as BasePropeties, Root, RootContent, RootContentMap, Text } from 'hast'
import { is } from 'unist-util-is'

export type Properties = BasePropeties & {
  className?: string[]
  id?: string
  href?: string
  src?: string
  target?: string
}

export interface Element extends BaseElement {
  properties?: Properties
}

export const isElement = (node: Node): node is Element => is<Element>(node, 'element')
export const isComment = (node: Node): node is Comment => is<Comment>(node, 'comment')
export const isRoot = (node: Node): node is Root => is<Root>(node, 'root')
export const isText = (node: Node): node is Text => is<Text>(node, 'text')
export const isDocType = (node: Node): node is DocType => is<DocType>(node, 'doctype')
export const isLiteral = (node: Node): node is Literal => 'value' in node
export const isParent = (node: Node): node is Parent => 'children' in node
export const isElementContent = (node: Node): node is ElementContent => isComment(node) || isElement(node) || isText(node)
export const isRootContent = (node: Node): node is RootContent => isElementContent(node) || isDocType(node)
export const isContent = (node: Node): node is Content => isRootContent(node) || isElementContent(node)

export function getAttribute<K extends keyof Properties>(node: Node, key: K): Properties[K] {
  if (!node || !isElement(node) || !node.properties) { return }
  return node.properties[key]
}

export function hasAttribute<K extends keyof Properties>(node: Node, key: K): boolean {
  if (!node || !isElement(node) || !node.properties) { return false }
  return key in node.properties
}

export function getClassList(node: Node): string[] {
  if (!isElement(node)) { return [] }
  return node.properties?.className ?? []
}

export function hasClass(node: Node, className: string): boolean {
  return getClassList(node).includes(className)
}

export { Content, ElementContent, ElementContentMap, RootContent, RootContentMap, Comment, Literal, Node, Parent, Root, Text, DocType }
export { is, matches, select, selectAll }

