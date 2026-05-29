import { createId } from "@/lib/id";
import {
  findVersionsByAssetId,
  findVersionById,
  createVersion,
  getNextVersionNumber,
} from "@/server/queries/version-queries";

interface CreateVersionInput {
  assetId: string;
  titleSnapshot: string;
  contentSnapshot: string;
  contentHash: string;
  changeNote?: string;
}

export async function getVersionsByAssetId(assetId: string) {
  return findVersionsByAssetId(assetId);
}

export async function getVersionById(id: string) {
  return findVersionById(id);
}

export async function createNewVersion(input: CreateVersionInput) {
  const versionNumber = await getNextVersionNumber(input.assetId);

  return createVersion({
    id: createId(),
    assetId: input.assetId,
    version: versionNumber,
    titleSnapshot: input.titleSnapshot,
    contentSnapshot: input.contentSnapshot,
    contentHash: input.contentHash,
    changeNote: input.changeNote ?? null,
    createdAt: Date.now(),
  });
}

export async function createInitialVersion(input: CreateVersionInput) {
  return createVersion({
    id: createId(),
    assetId: input.assetId,
    version: 1,
    titleSnapshot: input.titleSnapshot,
    contentSnapshot: input.contentSnapshot,
    contentHash: input.contentHash,
    changeNote: "Initial version",
    createdAt: Date.now(),
  });
}
