import { test as base } from "@playwright/test";


function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const mlsecond = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}:${mlsecond}`;
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;

}

export function generateBrandName(): string {
  const timestamp = formatDateTime(new Date());
  return `DL_Brand_${base.info().workerIndex}_${timestamp}`;
}

export function generateCategoryName(): string {
  const timestamp = formatDateTime(new Date());
  return `DL_Category_${base.info().workerIndex}_${timestamp}`;
}

export function generateProductName(): string {
  const timestamp = formatDateTime(new Date());
  return `DL_Product_${base.info().workerIndex}_${timestamp}`;
}

export function getDateRange(): { startDate: string; endDate: string } {

  const startDate = new Date();
  startDate.setDate(startDate.getDate());

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 31);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}