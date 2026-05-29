import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FolderOpen } from "lucide-react";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string | null;
  path: string | null;
  assetCount: number;
}

export function ProjectCard({ id, name, description, path, assetCount }: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {description && (
            <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>
          )}
          {path && (
            <p className="mb-2 truncate text-xs font-mono text-muted-foreground">{path}</p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FolderOpen className="h-3 w-3" />
            {assetCount} 个资产
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
