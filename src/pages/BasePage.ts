import { Locator, Page, expect } from "@playwright/test";

export abstract class BasePage {
  constructor(protected page: Page) { }

  private readonly commonLocators = {
    tableRow: "table tbody  tr",
    loadingIcon: ".fooicon-loader",
    tableHeader: ".footable-header th",
    deleteLink: "#delete-link",
    emptyData: ".footable-empty td",
    successAlert: ".alert-success span",
    searchInput: "#search[name='search']",
    searchFile: (page: Page) => page.getByPlaceholder("Search your files"),
    addFileButton: (page: Page) => page.getByRole("button", { name: "Add Files" }),
    fileSelectedText: "div.aiz-uploader-selected"
  } as const;

  private commonElement = this.createLocatorGetter(this.commonLocators);

  async goto(): Promise<void> { };
  abstract expectOnPage(): Promise<void>;

  protected async logFill(locator: Locator, value?: string) {
    const elementInfo = await this.getElementInfo(locator);
    const valueInfo = value ? ` with value: ${value}` : "";
    console.log(`[Fill] ${elementInfo}${valueInfo}`);
  }

  protected createLocatorGetter<
    T extends Record<string, string | ((page: Page) => Locator)>,
  >(locatorMap: T): (locatorName: keyof T) => Locator {
    return (locatorName: keyof T): Locator => {
      const locatorDef = locatorMap[locatorName];
      if (typeof locatorDef === "function") {
        return locatorDef(this.page);
      }
      return this.page.locator(locatorDef);
    };
  }

  protected async fillWithLog(
    locator: Locator,
    value: string,
    options?: {
      isSensitive?: boolean;
      fillOptions?: Parameters<Locator["fill"]>[1];
    },
  ) {
    const isSensitive = options?.isSensitive;
    const logValue = isSensitive ? "****" : value;
    await this.logFill(locator, logValue);
    await locator.fill(value, options?.fillOptions);
  }

  private async getElementInfo(locator: Locator): Promise<string> {
    if ((await locator.count()) === 0) {
      return locator.toString().replace("Locator@", "");
    }
    const text = (await locator.innerText()).trim();
    if (text) return text;
    for (const key of ["placeholder", "name", "aria-label", "id"]) {
      const value = await locator.getAttribute(key);
      if (value && value.trim()) return value.trim();
    }
    return locator.toString().replace("Locator@", "");
  }


  protected rowByName(name: string): Locator {
    return this.commonElement("tableRow").filter({ hasText: name }).nth(0);
  }

  protected iconByName(name: string, icon: string): Locator {
    return this.rowByName(name).locator(`a.btn-icon[title='${icon}']`);
  }

  protected async waitLoadingIconDisappear(): Promise<void> {
    await expect(this.commonElement("loadingIcon")).toBeHidden();
  }

  protected async deleteTheData(name: string): Promise<void> {
    await this.iconByName(name, "Delete").click();
    await expect(this.commonElement("deleteLink")).toBeVisible();
    await this.commonElement("deleteLink").click();
  }

  protected async displayNoData(name: string): Promise<void> {
    await expect(this.rowByName(name)).not.toBeAttached();
    await expect(this.commonElement("emptyData")).toHaveText("Nothing found");

  }

  protected async searchTheData(name: string): Promise<void> {
    const normalizeName = name.replaceAll(/--/g,'').trim();
    await this.commonElement("searchInput").fill(normalizeName);
    await this.commonElement("searchInput").press("Enter");
    await expect(this.commonElement("searchInput")).toHaveAttribute('value', normalizeName);
    await this.waitLoadingIconDisappear();
  }

  protected imageByTitle(title: string): Locator {
    return this.page.locator(`div.card-file[title='${title}']`).first();

  }

  protected async uploadImageByTitle(title: string): Promise<void> {
    await expect(this.commonElement("searchFile")).toBeVisible();
    await this.commonElement("searchFile").fill(title.replace(/\.(png|jpe?g)$/i, ""));
    await this.commonElement("searchFile").press("Enter");
    await this.waitLoadingIconDisappear();
    const gallery = this.imageByTitle(title);
    await expect(gallery).toBeVisible();
    await gallery.click();
    await expect(this.commonElement("fileSelectedText")).not.toContainText("0 File selected");
    await this.commonElement("addFileButton").click();
    const preview = this.page.locator(`div.file-preview-item[title='${title}']`).first();
    await expect(preview).toBeVisible();
  }


}
