import 'hast'

declare module 'hast' {
  interface Properties {
    [key: string]: string
    className?: string[]
  }
}
