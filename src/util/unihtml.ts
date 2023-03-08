import { parse, stringify } from './rehype'
import { transform, TransformContext } from './transform'

export function unihtml(html: string, handler: (context: TransformContext) => void) {
  const tree = parse(html)
  transform(tree, handler)
  return stringify(tree)
}
