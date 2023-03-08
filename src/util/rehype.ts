import { Parent } from 'hast'
import rehypeParse from 'rehype-parse'
import { Root } from 'rehype-parse/lib'
import rehypeStringify from 'rehype-stringify'
import { unified } from 'unified'

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