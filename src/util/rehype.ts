import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'
import { Parent, Root } from './element'

const processor = unified().use(rehypeParse, { fragment: true }).use(rehypeStringify)

export function parse(html: string) {
  return processor.parse(html)
}

export function stringify(tree: Parent) {
  return processor.stringify(tree as Root)
}

export function stringifyChildren({ children }: Parent) {
  return stringify({ type: 'root', children })
}