export type DiffLineType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffLineType;
  text: string;
  oldLineNumber: number | null;
  newLineNumber: number | null;
}

function buildLcsMatrix(oldLines: string[], newLines: string[]) {
  const matrix = Array.from({ length: oldLines.length + 1 }, () =>
    Array<number>(newLines.length + 1).fill(0),
  );

  for (let oldIndex = oldLines.length - 1; oldIndex >= 0; oldIndex -= 1) {
    for (let newIndex = newLines.length - 1; newIndex >= 0; newIndex -= 1) {
      matrix[oldIndex][newIndex] =
        oldLines[oldIndex] === newLines[newIndex]
          ? matrix[oldIndex + 1][newIndex + 1] + 1
          : Math.max(matrix[oldIndex + 1][newIndex], matrix[oldIndex][newIndex + 1]);
    }
  }

  return matrix;
}

export function diffTextSnapshots(oldText: string, newText: string) {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const matrix = buildLcsMatrix(oldLines, newLines);
  const diff: DiffLine[] = [];

  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length && newIndex < newLines.length) {
    if (oldLines[oldIndex] === newLines[newIndex]) {
      diff.push({
        type: "unchanged",
        text: oldLines[oldIndex],
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1,
      });
      oldIndex += 1;
      newIndex += 1;
      continue;
    }

    if (matrix[oldIndex + 1][newIndex] >= matrix[oldIndex][newIndex + 1]) {
      diff.push({
        type: "removed",
        text: oldLines[oldIndex],
        oldLineNumber: oldIndex + 1,
        newLineNumber: null,
      });
      oldIndex += 1;
      continue;
    }

    diff.push({
      type: "added",
      text: newLines[newIndex],
      oldLineNumber: null,
      newLineNumber: newIndex + 1,
    });
    newIndex += 1;
  }

  while (oldIndex < oldLines.length) {
    diff.push({
      type: "removed",
      text: oldLines[oldIndex],
      oldLineNumber: oldIndex + 1,
      newLineNumber: null,
    });
    oldIndex += 1;
  }

  while (newIndex < newLines.length) {
    diff.push({
      type: "added",
      text: newLines[newIndex],
      oldLineNumber: null,
      newLineNumber: newIndex + 1,
    });
    newIndex += 1;
  }

  return diff;
}
