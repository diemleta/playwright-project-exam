import * as allure from "allure-js-commons";
export { allure };

export const OWNER = "Diem Le";

export const EPIC = {
  AUTH: "Authentication",
  CATALOG: "Catalog Management",
  FULL: "Full Flow"
} as const;

export const FEATURE = {
  LOGIN: "Login",
  BRAND: "Brand Management",
  CATEGORY: "Category Management",
  PRODUCT: "Product Management",
  FULL: "Full flow from login to add product"
} as const;

export type AllureMeta = {
  epic: string;
  feature: string;
  story: string;
  severity?: allure.Severity;
  description?: string;
  id?: string;
  owner?: string;
  tmsUrl?: string;
};

export async function allureMeta(meta: AllureMeta): Promise<void> {
  await allure.epic(meta.epic);
  await allure.feature(meta.feature);
  await allure.story(meta.story);
  await allure.owner(meta.owner ?? OWNER);
  await allure.severity(meta.severity ?? allure.Severity.NORMAL);

  if (meta.description) await allure.description(meta.description);
  if (meta.id) await allure.allureId(meta.id);
  if (meta.tmsUrl) await allure.tms(meta.id ?? "TMS", meta.tmsUrl);
}



