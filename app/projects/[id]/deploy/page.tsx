import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ProjectDeployClient } from "@/components/deployment/project-deploy-client";
import { Button } from "@/components/ui/button";
import { getProjectDeploymentPageData } from "@/server/services/deployment-service";

interface ProjectDeployPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDeployPage({ params }: ProjectDeployPageProps) {
  const { id } = await params;
  const data = await getProjectDeploymentPageData(id).catch(() => null);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-2">
        <Link href={`/projects/${id}`}>
          <ArrowLeft className="h-4 w-4" />
          返回项目详情
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold">部署项目资产</h1>
        <p className="text-sm text-muted-foreground">{data.project.name}</p>
      </div>

      <ProjectDeployClient project={data.project} targets={data.targets} />
    </div>
  );
}
