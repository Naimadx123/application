import fs from 'fs/promises';
import path from 'path';

/**
 * Recursively retrieves all file paths from a given directory and its subdirectories
 * that match a specific file extension.
 *
 * @param {string} dir - The directory path to search in.
 * @param {string} extension - The file extension to filter files by (e.g., '.ts', '.js').
 * @returns {Promise<string[]>} A promise that resolves to an array of file paths that match the extension.
 *
 * @example
 * // Example usage: get all '.ts' files in the directory
 * const files = await getFiles('/path/to/dir', '.ts');
 * console.log(files); // ['file1.ts', 'subdir/file2.ts']
 */
export async function getFiles(dir: string, extension: string): Promise<string[]> {
  const items = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    items.map(async item =>
      item.isDirectory()
        ? getFiles(path.join(dir, item.name), extension)
        : item.isFile() && item.name.endsWith(extension)
          ? path.join(dir, item.name)
          : []
    )
  );

  return files.flat();
}
