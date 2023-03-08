import { toText } from 'hast-util-to-text'
import { Parent } from './element'

export interface TextifyOptions {
  trim?: boolean
  multiLine?: boolean
}

export function textify(tree: Parent, options: Partial<TextifyOptions> = {}) {
  const { trim, multiLine }: TextifyOptions = { trim: true, multiLine: false, ...options }
  let text = toText(tree)
  text = text.replace(/ ?\n+ ?\n*/g, '\n')
  if (!multiLine) { text = text.replace(/\n/g, ' ') }
  if (trim) { text = text.replace(/ +/g, ' ').trim() }
  return text
}

export function textifyChildren({ children }: Parent) {
  return textify({ type: 'root', children })
}
