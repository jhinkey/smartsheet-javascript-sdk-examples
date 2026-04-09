/**
 * Calls folders.getFolderChildren for a folder ID.
 *
 * Requires SMARTSHEET_API_TOKEN in the environment.
 *
 * Usage:
 *   node examples/get-folder-children.js <folderId>
 *   npm run example:folder-children -- <folderId>
 */
import smartsheet from 'smartsheet';

const token = process.env.SMARTSHEET_API_TOKEN;
const folderIdRaw = process.argv[2];

if (!token?.trim()) {
  console.error('Set SMARTSHEET_API_TOKEN in your environment.');
  process.exit(1);
}

const folderId = Number(folderIdRaw);
if (folderIdRaw === undefined || folderIdRaw === '' || !Number.isFinite(folderId)) {
  console.error('Usage: node examples/get-folder-children.js <folderId>');
  process.exit(1);
}

const client = smartsheet.createClient({ accessToken: token });

try {
  const folder =
    await client.folders.getFolderMetadata({ folderId });

  console.log(
    `Folder:`,
    `\n  Name: ${folder.name},`,
    `\n  ID: ${folder.id},`,
    `\n  Permalink: ${folder.permalink},`,
    `\n  Created At: ${folder.createdAt},`,
    `\n  Modified At: ${folder.modifiedAt}`
  );

  const sheets = [];
  const reports = [];
  const sights = [];
  const folders = [];
  const templates = [];
  let lastKey = '';

  do {
    const page = await client.folders.getFolderChildren({
      folderId,
      queryParameters: { lastKey },
    });
    const children = page?.data ?? [];
    for (const child of children) {
      switch (child?.resourceType) {
        case 'sheet':
          sheets.push(child);
          break;
        case 'report':
          reports.push(child);
          break;
        case 'sight':
          sights.push(child);
          break;
        case 'folder':
          folders.push(child);
          break;
        case 'template':
          templates.push(child);
          break;
        default:
          break;
      }
    }
    lastKey = page?.lastKey;
  } while (lastKey);

  const data = { folder, sheets, reports, sights, folders, templates };
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error(err);
  process.exit(1);
}
