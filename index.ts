import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import {removePosition} from 'unist-util-remove-position'
import unified from 'unified'
import { CONTINUE, EXIT, SKIP, visit, Visitor } from 'unist-util-visit'

export interface Data<T = unknown> {
  [key: string]: T
}

export interface Point {
  line: number
  column: number
  offset?: number
}

export interface Position {
  start: Point
  end: Point
  indent?: number[]
}

export interface BaseNode {
  type: string;
  data?: Data
  position?: Position
}

export interface Node extends BaseNode {
  children?: Node[]
  tagName?: string
  value?: string
  properties?: Data<string> & { className?: string[] }
}

export interface Parent extends Node {
  children: Node[]
}

export type TestPredicate = (node: Node, index?: number, parent?: Parent) => boolean

export type Pattern = string | RegExp

export interface Context {
  custom: (test: TestPredicate, visitor: Visitor<Node>) => void,
  remove: (test: TestPredicate) => void
  removeEmptyTags: (patterns: Pattern[]) => void,
  removeClassNames: (patterns: Pattern[]) => void,
  removeAttributes: (patterns: Pattern[]) => void,
  unwrap: (test: TestPredicate) => void
  clean: () => void
}

function createMatcher(patterns: Pattern[], positive = true) {
  return (needle: string) => (patterns.findIndex((pattern) => {
    return ((pattern instanceof RegExp) ? pattern.test(needle) : needle === pattern) === positive
  }) !== -1)
}

const processor = unified().use(rehypeParse, { fragment: true }).use(rehypeStringify)

export function transform(tree: Node, handler: (context: Context) => void) {
  const context: Context = {
    custom: (test, visitor) => { visit(tree, test, visitor) },
    remove: (test) => {
      visit(tree, test, (_node, index, parent) => {
        if (index === null || parent === null) { return }
        parent.children.splice(index, 1)
        return [SKIP, index]
      })
    },
    removeEmptyTags: (patterns) => {
      const matcher = createMatcher(patterns)
      visit(tree, ({ type, tagName, children }: Node) => {
        if (type !== 'element' || tagName == null || !matcher(tagName)) { return false }
        return children == null || children.length === 0
      }, (_node, index, parent) => {
        if (index === null || parent === null) { return }
        parent.children.splice(index, 1)
        return [SKIP, index]
      })
    },
    removeAttributes: (patterns) => {
      const matcher = createMatcher(patterns)
      visit(tree, ({ type, properties }: Node) => {
        if (type !== 'element' || !properties) { return false }
        return Object.keys(properties).findIndex(matcher) !== -1
      }, (node: Node, index: number | null, parent: Parent | null) => {
        if (node.properties == null || index === null || parent === null) { return }
        node.properties = Object.entries(node.properties ?? {}).reduce<Data<string>>((obj, [name, value]) => {
          if (!matcher(name)) { obj[name] = value }
          return obj
        }, {})
        return [CONTINUE]
      })
    },
    removeClassNames: (patterns) => {
      const matcher = createMatcher(patterns, false)
      visit(tree, ({ type, properties }: Node) => {
        if (type !== 'element' || !properties?.className) { return false }
        return properties.className.findIndex(matcher) === -1
      }, ({ properties }: Node, index: number | null, parent: Parent | null) => {
        if (properties == null || properties.className == null || index === null || parent === null) { return }
        properties.className = properties.className.filter(matcher)
        if (properties.className.length === 0) { delete properties.className }
        return [CONTINUE]
      })
    },
    unwrap: (test) => {
      visit(tree, test, (node: Node, index: number | null, parent: Parent | null) => {
        if (index === null || parent === null) { return }
        parent.children.splice(index, 1, ...(node.children ?? []))
        return [SKIP, index]
      })
    },
    clean: () => {
      visit(tree, (node: Node) => {
        if (node.type !== 'text') { return false }
        if (!node.value) { return true }
        if (node.value === ' ') { return false }
        return node.type === 'text' && node.value != null && node.value.trim().length === 0
      }, (_node: Node, index: number | null, parent: Parent | null) => {
        if (index === null || parent === null) { return }
        parent.children.splice(index, 1)
        return [SKIP, index]
      })
      removePosition(tree, true)
    }
  }
  handler(context)
  return tree
}

export function parse(html: string) {
  return processor.parse(html)
}

export function stringify(tree: Node) {
  return processor.stringify(tree)
}

export function unihtml(html: string, handler: (context: Context) => void) {
  const tree = parse(html)
  transform(tree, handler)
  return stringify(tree)
}

export { SKIP, EXIT, CONTINUE }
