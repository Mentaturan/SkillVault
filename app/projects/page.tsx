import { getAllProjects } from "@/server/services/project-service";
import { ProjectCard } from "@/components/projects/project-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">项目</h1>
          <p className="text-sm text-muted-foreground">管理项目工作区中的资产</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            新建项目
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">还没有项目</p>
          <Button asChild variant="link" className="mt-2">
            <Link href="/projects/new">创建第一个项目</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              id={p.id}
              name={p.name}
              description={p.description}
              path={p.path}
              assetCount={p.projectAssets?.length ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
