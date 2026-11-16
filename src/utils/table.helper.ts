import { Locator } from "@playwright/test";

function normalizeHeaderKey(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/\s+([a-z])/g, (_, letter) => letter.toUpperCase());
}

export async function buildColumnMap(headers: Locator) {
    const count = await headers.count();
    const map: Record<string, number> = {};

    for (let i = 0; i < count; i++) {
        const header = headers.nth(i);
        const datasetKey = (await header.getAttribute('data-column-key')) || '';
        const rawText = ((await header.textContent()) || '').trim();
        const key = normalizeHeaderKey(datasetKey || rawText);
        if (key) {
            map[key] = i;
        }
    }
    return map;
}

export async function readCellText(row: Locator, cellIndex: number) {
    return ((await row.locator('td').nth(cellIndex).textContent()) || '').trim();

}