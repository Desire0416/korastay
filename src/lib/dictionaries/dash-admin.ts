// ============================================================
// Administration (/admin) : un module par groupe de navigation
// (src/lib/dictionaries/admin/*), assembles sous `dict.dashAdmin`.
// Le FR de chaque module sert de type de reference.
// ============================================================

import { adminOpsFr, adminOpsEn, type AdminOpsDict } from "./admin/ops";
import { adminCatalogFr, adminCatalogEn, type AdminCatalogDict } from "./admin/catalog";

export interface DashAdminDict {
  ops: AdminOpsDict;
  catalog: AdminCatalogDict;
}

export const dashAdminFr: DashAdminDict = {
  ops: adminOpsFr,
  catalog: adminCatalogFr,
};

export const dashAdminEn: DashAdminDict = {
  ops: adminOpsEn,
  catalog: adminCatalogEn,
};
