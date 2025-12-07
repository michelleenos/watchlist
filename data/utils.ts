import { fileURLToPath } from 'url'
import { dirname } from 'path'

export const getDir = () => dirname(fileURLToPath(import.meta.url))

export const toFilename = (name: string) =>
    name
        .replace(/[^\w\s-]|_/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
