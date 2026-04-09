/**
 * Calls workspaces.getWorkspaceChildren for a workspace ID.
 *
 * Requires SMARTSHEET_API_TOKEN in the environment.
 *
 * Usage:
 *   node examples/get-workspace-children.js <workspaceId>
 *   npm run example:workspace-children -- <workspaceId>
 */
import smartsheet from 'smartsheet';

const token = process.env.SMARTSHEET_API_TOKEN;
const workspaceIdRaw = process.argv[2];

if (!token?.trim()) {
  console.error('Set SMARTSHEET_API_TOKEN in your environment.');
  process.exit(1);
}

const workspaceId = Number(workspaceIdRaw);
if (workspaceIdRaw === undefined || workspaceIdRaw === '' || !Number.isFinite(workspaceId)) {
  console.error('Usage: node examples/get-workspace-children.js <workspaceId>');
  process.exit(1);
}

const client = smartsheet.createClient({ accessToken: token });

try {
  const workspace =
    await client.workspaces.getWorkspaceMetadata({ workspaceId });

  console.log(
    `Workspace: ${workspace.name},`,
    `ID: ${workspace.id},`,
    `Access Level: ${workspace.accessLevel},`,
    `Permalink: ${workspace.permalink},`,
    `Created At: ${workspace.createdAt},`,
    `Modified At: ${workspace.modifiedAt}`
  );

  const sheets = [];
  const reports = [];
  const sights = [];
  const folders = [];
  const templates = [];
  let lastKey = '';

  do {
    const page = await client.workspaces.getWorkspaceChildren({
      workspaceId,
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

  const data = { workspace, sheets, reports, sights, folders, templates };
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error(err);
  process.exit(1);
}
