import { Element } from 'hast'
import { is } from 'unist-util-is'
import { parse, select, unihtml } from './index'

function main() {
  const source = `
  <div class="elementor">
    <div class="elementor-row">
      <div class="elementor-column"><p data-foobar="Hello World"><strong>First</strong> <strong>Line</strong></p></div>
      <div class="elementor-column foobar"><p>Second Line</p></div>
    </div>
    <div class="elementor-row">
      <div class="elementor-column"><p>Third Line</p></div>
      <div class="elementor-column"><p>Fourth Line</p></div>
    </div>
  </div>`

  document.getElementById('source')!.textContent = source

  const target = unihtml(source, ({ removeAttributes, unwrap, removeClassNames, clean, removeEmptyTags }) => {
    removeAttributes([/^data/])
    unwrap((node) => {
      if (!is<Element>(node, 'element')) { return }
      return node.tagName === 'div' && node.properties?.className?.findIndex((className) => /^elementor/.test(className)) !== -1
    })
    removeClassNames([/^elementor/])
    clean()
    removeEmptyTags(['section'])
  })
  document.getElementById('target')!.textContent = target

  const tree = parse(source)
  debugger
  const node = select('.foobar', tree)
  // const result = textify(tree, { multiLine: true })
  debugger
}

main()
