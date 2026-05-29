import { ProjectForm } from "@/components/projects/project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">新建项目</h1>
        <p className="text-sm text-muted-foreground">创建一个新的项目工作区</p>
      </div>
      <ProjectForm />
    </div>
  );
}
