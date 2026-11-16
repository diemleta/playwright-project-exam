import categoryData from "../category/category-data.json";
import { generateCategoryName } from "../common/data.factory";


export type CategoryType = "Physical" | "Digital";

export type Category = {
    name: string,
    parentCategory?: string,
    orderingNumber?: string,
    type?: CategoryType,
    banner?: string,
    icon?: string,
    metaTitle?: string,
    metaDescription?: string,
    filteringAttributes?: string,
}

export function createMinimalCategory() {
    return {
        ...categoryData.minimalCategory.data,
        name: generateCategoryName(),
    };
}

export function createFullCategory(): Category {
    const data = categoryData.fullCategory.data[0];
    return {
        ...data,
        type: data.type as CategoryType,
        name: generateCategoryName(),
    };
}

export function createEditCategory(): Category {
    const data = categoryData.fullCategory.data[1];
    return {
        ...data,
        type: data.type as CategoryType,

    };

}
