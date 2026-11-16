import {auth, type AuthFixture} from "./auth.fixture";
import { appFixtures, type AppFixture } from "./app.fixture";
import { brandDataFixtures, type BrandDataFixture } from "./brand-data.fixture";
import { categoryDataFixtures, type CategoryDataFixture } from "./category-data.fixture";
import { productDataFixtures, type ProductDataFixture } from "./product-data.fixture";


export type GateKeeperFixture = AuthFixture & AppFixture 
& BrandDataFixture
& CategoryDataFixture
& ProductDataFixture;

export const test = auth.extend<GateKeeperFixture>({ ...appFixtures, ...brandDataFixtures, ...categoryDataFixtures, ...productDataFixtures});
export { expect } from "@playwright/test";