import fs from 'fs';
import * as path from 'node:path';

export default async function globalSetup() {
  fs.rmSync(path.resolve(__dirname, '../../reports/allure-results'), { recursive: true, force: true });
}
