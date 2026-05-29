import type { DeploymentStatus, DeploymentTargetKey } from "@/lib/constants";

export interface DeploymentTargetView {
  id: string;
  key: DeploymentTargetKey;
  label: string;
  description: string;
  placeholder: string;
  path: string;
  enabled: boolean;
}

export interface AssetDeploymentStatusView {
  targetId: string;
  targetKey: DeploymentTargetKey;
  targetLabel: string;
  configuredPath: string;
  targetFilePath: string | null;
  targetFilename: string | null;
  enabled: boolean;
  status: DeploymentStatus;
  statusReason: string;
  lastDeployedAt: number | null;
  lastBackupPath: string | null;
}

export interface AssetDeploymentPreviewView {
  assetId: string;
  assetTitle: string;
  targetId: string;
  targetKey: DeploymentTargetKey;
  targetLabel: string;
  targetDirectoryPath: string;
  targetFilePath: string;
  targetFilename: string;
  renderedContent: string;
  renderedContentHash: string;
  existingFile: {
    status: "missing" | "matched" | "different" | "unreadable";
    contentHash: string | null;
    size: number | null;
  };
  plannedAction: "create" | "overwrite" | "sync_record";
  backupPath: string | null;
  warnings: string[];
  canDeploy: boolean;
  liveStatus: AssetDeploymentStatusView;
}

export interface AssetDeploymentExecutionView {
  targetFilePath: string;
  targetFilename: string;
  deployedAt: number;
  createdBackup: boolean;
  backupPath: string | null;
}
