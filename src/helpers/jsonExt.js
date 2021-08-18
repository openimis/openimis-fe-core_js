export function formatJsonField(json) {
  return `"${JSON.stringify(json).replace(/\"/g, '\\"')}"`;
}
