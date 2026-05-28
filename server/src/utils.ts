export const toFilename = (name: string) =>
    name
        .replace(/[^\w\s-]|_/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
