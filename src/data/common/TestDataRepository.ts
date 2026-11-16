import login from '../login/login-cases.json'
import category from '../category/category-data.json'

type DataEntry = {
  description?: string;
  data: unknown;
};

type DataCatalog = Record<string, Record<string, DataEntry>>;


export const testDataCatalog = {
  login,
  category,
} as const satisfies DataCatalog;

export type TestDataCatalog = typeof testDataCatalog;
export type TestDataNamespace = keyof TestDataCatalog;

type CatalogEntry<
  N extends TestDataNamespace,
  K extends keyof TestDataCatalog[N]
> = TestDataCatalog[N][K] extends { data: infer D }
  ? TestDataCatalog[N][K] & { data: D }
  : never;

export type CatalogData<
  N extends TestDataNamespace,
  K extends keyof TestDataCatalog[N]
> = CatalogEntry<N, K>['data'];

type GetTestDataOptions<N extends TestDataNamespace, K extends keyof TestDataCatalog[N]> = {
  overrides?: Partial<CatalogData<N, K>>;
  transform?: (data: CatalogData<N, K>) => CatalogData<N, K>;
};

function cloneData<T>(data: T): T {
  return structuredClone
    ? structuredClone(data)
    : JSON.parse(JSON.stringify(data));
}

export function getTestData<
  N extends TestDataNamespace,
  K extends keyof TestDataCatalog[N]
>(
  namespace: N,
  key: K,
  options?: GetTestDataOptions<N, K>
): CatalogData<N, K> {

  const entry = testDataCatalog[namespace][key] as CatalogEntry<N, K>;

  if (!entry) {
    throw new Error(`Unknown test data entry: ${String(namespace)}.${String(key)}`);
  }

  const base = cloneData(entry.data) as CatalogData<N, K>;

  if (options?.overrides) {
    if (Array.isArray(base) || typeof base !== 'object' || base === null) {
      throw new Error(
        `Overrides are only supported for object data. Use transform() for arrays or primitives: ${String(
          namespace
        )}.${String(key)}`
      );
    }

    Object.assign(base as object, options.overrides);
  }

  return options?.transform ? options.transform(base) : base;
}
