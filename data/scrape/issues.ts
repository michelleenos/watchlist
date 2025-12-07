#!/usr/bin/env ts-node

import fs from 'fs/promises'

async function main() {
    const file = await fs.readFile('data/movies-with-info-2.json', 'utf-8')
    const movies = JSON.parse(file)

    const issues: any[] = []

    movies.forEach((movie: { name: string; url: string; desc?: string }) => {
        if (!movie.desc) {
            issues.push(movie)
        }
    })

    await fs.writeFile('./data/issues.json', JSON.stringify(issues, null, 2))
}

main()
