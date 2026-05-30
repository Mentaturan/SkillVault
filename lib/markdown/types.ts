import type {
  AssetType,
  TargetTool,
  ExportPreset,
  AssetStatus,
  Visibility,
  AssetSource,
} from "@/lib/constants";

export interface MarkdownFrontmatter {
  syncId: string;
  title: string;
  type: AssetType;
  targetTool: TargetTool;
  exportPreset: ExportPreset;
  status?: AssetStatus;
  visibility?: Visibility;
  source?: AssetSource;
  sourceUrl?: string | null;
  sourceRef?: string | null;
  sourcePath?: string | null;
  sourceImportedAt?: number | null;
  sourceChecksum?: string | null;
  pinned?: boolean;
  description?: string | null;
  scenario?: string | null;
  tags?: string[];
}

export interface ParsedMarkdownAsset {
  frontmatter: MarkdownFrontmatter;
  content: string;
}

export interface ParseError {
  message: string;
  line?: number;
}
