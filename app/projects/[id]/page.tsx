import { getProjectById } from "@/server/services/project-service";
import { getAssets } from "@/server/services/asset-service";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "@/components/projects/project-detail-client";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const allAssets = await getAssets();
  const existingAssetIds = new Set(project.projectAssets?.map((pa) => pa.assetId) ?? []);
  const availableAssets = allAssets
    .filter((a) => !existingAssetIds.has(a.id))
    .map((a) => ({ id: a.id, title: a.title, type: a.type }));

  const projectAssetsList = project.projectAssets?.map((pa) => ({
    assetId: pa.assetId,
    orderIndex: pa.orderIndex,
    asset: pa.asset,
  })) ?? [];

  return (
    <ProjectDetailClient
      project={project}
      projectAssets={projectAssetsList}
      availableAssets={availableAssets}
    />
  );
}
