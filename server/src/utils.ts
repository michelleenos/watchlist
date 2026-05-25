import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs/promises'
import path from 'path'

export const getDir = () => dirname(fileURLToPath(import.meta.url))

export const toFilename = (name: string) =>
    name
        .replace(/[^\w\s-]|_/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()

export const backupJson = async (json: unknown, name = 'movies') => {
    await backup(JSON.stringify(json), `${name}.json`)
}

export const backup = async (content: string, fileName: string) => {
    const date = new Date()
    const datename = date.toISOString().replaceAll('.', '_')
    const dir = getDir()
    const pathname = path.resolve(dir, '../data/old')

    await fs.writeFile(`${pathname}/${datename}-${fileName}`, content)
}

export const getFileIfExists = async (filePath: string) => {
    try {
        const contents = await fs.readFile(filePath, 'utf8')
        return contents
    } catch (err) {
        console.log(err)
        return false
    }
}

export const getCurrentMovies = async () => {
    const dir = getDir()
    const pathname = path.resolve(dir, '../data/movies.json')
    const contents = await fs.readFile(pathname, 'utf8')
    return JSON.parse(contents)
}

export const updateData = async (data: string, file: string) => {
    const dataPath = path.resolve(getDir(), '../data')
    const current = await getFileIfExists(`${dataPath}/${file}`)

    if (current) {
        await backup(current, file)
    }

    await fs.writeFile(`${dataPath}/${file}`, data)
}
