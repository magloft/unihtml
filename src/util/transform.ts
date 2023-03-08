import { Test } from 'unist-util-is'
import { removePosition } from 'unist-util-remove-position'
import { CONTINUE, EXIT, SKIP, visit, Visitor } from 'unist-util-visit'
import { isElement, isText, Node, Parent, Properties } from './element'

export type Pattern = string | RegExp

export interface TransformContext {
  custom: (test: Test, visitor: Visitor<Node>) => void,
  remove: (test: Test) => void
  removeEmptyTags: (patterns: Pattern[]) => void,
  removeClassNames: (patterns: Pattern[]) => void,
  removeAttributes: (patterns: Pattern[]) => void,
  unwrap: (test: Test) => void
  clean: () => void
}

export function transform(tree: Node, handler: (context: TransformContext) => void) {
  const context: TransformContext = {
    custom: (test, visitor) => {
      visit(tree as Node, test, visitor)
    },
    remove: (test) => {
      visit(tree, test, (_node, index, parent: Parent) => {
        if (index === null || parent === null) { return }
        parent.children.splice(index, 1)
        return [SKIP, index]
      })
    },
    removeEmptyTags: (patterns) => {
      const matcher = createMatcher(patterns)
      visit(tree, (node) => {
        if (!isElement(node)) { return false }
        if (!matcher(node.tagName)) { return false }
        return node.children == null || node.children.length === 0
      }, (_node, index, parent: Parent) => {
        if (index === null || parent === null) { return }
        parent.children.splice(index, 1)
        return [SKIP, index]
      })
    },
    removeAttributes: (patterns) => {
      const matcher = createMatcher(patterns)
      visit(tree, (node) => {
        if (!isElement(node) || !node.properties) { return false }
        return Object.keys(node.properties).findIndex(matcher) !== -1
      }, (node, index: number | null, parent: Parent | null) => {
        if (!isElement(node) || node.properties == null || index === null || parent === null) { return }
        node.properties = Object.entries(node.properties ?? {}).reduce<Properties>((obj, [name, value]) => {
          if (!matcher(name)) { obj[name] = value }
          return obj
        }, {})
        return [CONTINUE]
      })
    },
    removeClassNames: (patterns) => {
      const matcher = createMatcher(patterns, false)
      visit(tree, (node) => {
        if (!isElement(node) || !node.properties?.className) { return false }
        return node.properties.className.findIndex(matcher) === -1
      }, (node: Node, index: number | null, parent: Parent | null) => {
        if (!isElement(node) || !node.properties?.className || index === null || !parent) { return }
        node.properties.className = node.properties.className.filter(matcher)
        if (node.properties.className.length === 0) { delete node.properties.className }
        return [CONTINUE]
      })
    },
    unwrap: (test) => {
      visit(tree, test, (node, index: number | null, parent: Parent | null) => {
        if (index === null || parent === null) { return }
        const children = (node as Parent).children ?? []
        parent.children.splice(index, 1, ...children)
        return [SKIP, index]
      })
    },
    clean: () => {
      visit(tree, (node) => {
        if (!isText(node)) { return false }
        if (!node.value) { return true }
        if (node.value === ' ') { return false }
        return node.value != null && node.value.trim().length === 0
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

function createMatcher(patterns: Pattern[], positive = true) {
  return (needle: string) => (patterns.findIndex((pattern) => {
    return ((pattern instanceof RegExp) ? pattern.test(needle) : needle === pattern) === positive
  }) !== -1)
}

export { CONTINUE, EXIT, SKIP }
