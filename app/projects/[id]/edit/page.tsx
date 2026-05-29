import { getProjectById } from "@/server/services/project-service";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/projects/project-form";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">编辑项目</h1>
        <p className="text-sm text-muted-foreground">{project.name}</p>
      </div>
      <ProjectForm project={project} />
    </div>
  );
}
