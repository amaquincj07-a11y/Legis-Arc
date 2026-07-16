import { Globe, GlobeLock, type LucideIcon } from "lucide-react";

import type { AdminActionItem } from "@/components/admin/admin-actions-menu";
import type { DocumentStatus } from "@/lib/types";

type PublishableDocument = {
  status: DocumentStatus;
  isPublic: boolean;
};

export function isPubliclyVisible(doc: PublishableDocument): boolean {
  return doc.status === "published" && doc.isPublic;
}

export function createPublishVisibilityAction(
  doc: PublishableDocument,
  onToggle: () => void | Promise<void>
): AdminActionItem {
  const published = isPubliclyVisible(doc);

  return {
    label: published ? "Unpublish from portal" : "Publish to portal",
    icon: published ? GlobeLock : Globe,
    accent: published ? "unpublish" : "publish",
    onClick: onToggle,
  };
}

export function getVisibilityMeta(doc: PublishableDocument): {
  published: boolean;
  label: string;
  icon: LucideIcon;
} {
  const published = isPubliclyVisible(doc);

  return {
    published,
    label: published ? "Published" : "Unpublished",
    icon: published ? Globe : GlobeLock,
  };
}
