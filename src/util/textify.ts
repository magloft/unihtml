import { toText } from 'hast-util-to-text'
import { Content, isParent, Node, Parent } from './element'

export interface TextifyOptions {
  trim?: boolean
  multiLine?: boolean
}

export function textify(node?: Node | null, options: Partial<TextifyOptions> = {}): string {
  if (!node) { return '' }
  const root: Parent = isParent(node) ? node : { type: 'root', children: [node as Content] }
  const { trim, multiLine }: TextifyOptions = { trim: true, multiLine: false, ...options }
  let text = toText(root as any)
  text = text.replace(/ ?\n+ ?\n*/g, '\n')
  if (!multiLine) { text = text.replace(/\n/g, ' ') }
  if (trim) { text = text.replace(/ +/g, ' ').trim() }
  return text
}
