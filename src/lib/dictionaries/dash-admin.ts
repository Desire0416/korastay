// ============================================================
// Administration (/admin) : un module par groupe de navigation
// (src/lib/dictionaries/admin/*), assembles sous `dict.dashAdmin`.
// Le FR de chaque module sert de type de reference.
// ============================================================

import { adminOpsFr, adminOpsEn, type AdminOpsDict } from "./admin/ops";
import { adminCatalogFr, adminCatalogEn, type AdminCatalogDict } from "./admin/catalog";
import { adminCommunityFr, adminCommunityEn, type AdminCommunityDict } from "./admin/community";
import { adminSystemFr, adminSystemEn, type AdminSystemDict } from "./admin/system";

export interface DashAdminDict {
  ops: AdminOpsDict;
  catalog: AdminCatalogDict;
  community: AdminCommunityDict;
  system: AdminSystemDict;
}

export const dashAdminFr: DashAdminDict = {
  ops: adminOpsFr,
  catalog: adminCatalogFr,
  community: adminCommunityFr,
  system: adminSystemFr,
};

export const dashAdminEn: DashAdminDict = {
  ops: adminOpsEn,
  catalog: adminCatalogEn,
  community: adminCommunityEn,
  system: adminSystemEn,
};
