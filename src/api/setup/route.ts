import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  createProductsWorkflow,
  createProductCategoriesWorkflow,
  createRegionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

const barDiamondProducts = [
  { title: "Freeze-Dried Rumen Microbial Suspension (#FDRF)", handle: "fdrf", description: "Freeze-dried rumen microbial suspension for long-term storage.", price: 10000, sku: "FDRF", category: "Rumen Fluid" },
  { title: "Fresh Rumen Fluid, 1 liter (#FRF)", handle: "frf", description: "Fresh rumen fluid for veterinary and research use.", price: 25000, sku: "FRF", category: "Rumen Fluid" },
  { title: "Sterilized Rumen Fluid, 180 mls (#SRF)", handle: "srf", description: "Sterilized rumen fluid for laboratory use.", price: 25000, sku: "SRF", category: "Rumen Fluid" },
  { title: "#1C 4\" Rumen Cannula", handle: "1c", description: "4 inch rumen cannula with rolled inner flange.", price: 32500, sku: "1C", category: "Rumen Cannulas" },
  { title: "#1C5 5\" Rumen Cannula", handle: "1c5", description: "5 inch rumen cannula with rolled inner flange.", price: 35000, sku: "1C5", category: "Rumen Cannulas" },
  { title: "#2C 4\" Rumen Cannula", handle: "2c", description: "4 inch rumen cannula with matching flanges.", price: 32500, sku: "2C", category: "Rumen Cannulas" },
  { title: "#3C 4\" Rumen Cannula X-deep", handle: "3c", description: "4 inch extra-deep rumen cannula.", price: 33500, sku: "3C", category: "Rumen Cannulas" },
  { title: "#4C 3\" Rumen Cannula", handle: "4c", description: "3 inch rumen cannula.", price: 32500, sku: "4C", category: "Rumen Cannulas" },
  { title: "#5C Rumen Cannula", handle: "5c", description: "Standard rumen cannula.", price: 30000, sku: "5C", category: "Rumen Cannulas" },
  { title: "#6C Rumen Cannula", handle: "6c", description: "Standard rumen cannula.", price: 30000, sku: "6C", category: "Rumen Cannulas" },
  { title: "#7C Rumen Cannula", handle: "7c", description: "Standard rumen cannula.", price: 30000, sku: "7C", category: "Rumen Cannulas" },
  { title: "#8C Rumen Cannula", handle: "8c", description: "Standard rumen cannula.", price: 30000, sku: "8C", category: "Rumen Cannulas" },
  { title: "#9C 4\" Rumen Cannula", handle: "9c", description: "4 inch rumen cannula with mirrored flanges.", price: 32500, sku: "9C", category: "Rumen Cannulas" },
  { title: "#9CX 4\" Rumen Cannula Extra Deep", handle: "9cx", description: "4 inch extra-deep rumen cannula.", price: 33500, sku: "9CX", category: "Rumen Cannulas" },
  { title: "#10C 3\" Rubber Cannula", handle: "10c", description: "3 inch rubber cannula.", price: 20000, sku: "10C", category: "Rubber Cannulas" },
  { title: "#11C 2\" Rubber Cannula", handle: "11c", description: "2 inch rubber cannula.", price: 20000, sku: "11C", category: "Rubber Cannulas" },
  { title: "#11E-C Esophageal Cannula - Cattle", handle: "11e-c", description: "Esophageal cannula for cattle.", price: 15000, sku: "11E-C", category: "Esophageal Cannulas" },
  { title: "#11E-S Esophageal Cannula - Sheep", handle: "11e-s", description: "Esophageal cannula for sheep.", price: 15000, sku: "11E-S", category: "Esophageal Cannulas" },
  { title: "#RT Rumen Fluid Sampler Tube", handle: "rt", description: "Rumen fluid sampler tube.", price: 16000, sku: "RT", category: "Accessories" },
  { title: "#1W Washer for #1C", handle: "1w", description: "Replacement washer for #1C.", price: 9500, sku: "1W", category: "Washers" },
  { title: "#1W5 Washer for #1C5", handle: "1w5", description: "Replacement washer for #1C5.", price: 9500, sku: "1W5", category: "Washers" },
  { title: "#2-3W Washer for #2C/#3C", handle: "2-3w", description: "Replacement washer for #2C and #3C.", price: 9500, sku: "2-3W", category: "Washers" },
  { title: "#4W Washer for #4C", handle: "4w", description: "Replacement washer for #4C.", price: 9500, sku: "4W", category: "Washers" },
  { title: "#8W Washer for #8C", handle: "8w", description: "Replacement washer for #8C.", price: 9500, sku: "8W", category: "Washers" },
  { title: "#10W Washer for #10C", handle: "10w", description: "Replacement washer for #10C.", price: 9500, sku: "10W", category: "Washers" },
  { title: "#11W Washer for #11C", handle: "11w", description: "Replacement washer for #11C.", price: 9000, sku: "11W", category: "Washers" },
];

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = req.scope.resolve(Modules.SALES_CHANNEL);
  const regionModuleService = req.scope.resolve(Modules.REGION);
  const fulfillmentModuleService = req.scope.resolve(Modules.FULFILLMENT);

  try {
    // Check if publishable API key already exists
    const { data: existingKeys } = await query.graph({
      entity: "api_key",
      fields: ["id", "token", "title"],
      filters: { type: "publishable" },
    });

    // Check if products already exist
    const { data: existingProducts } = await query.graph({
      entity: "product",
      fields: ["id"],
    });

    if (existingKeys?.length > 0 && existingProducts?.length > 0) {
      return res.json({
        message: "Setup complete",
        publishableApiKey: existingKeys[0].token,
        productCount: existingProducts.length,
      });
    }

    // Get or create default sales channel
    let salesChannels = await salesChannelModuleService.listSalesChannels({ name: "Default Sales Channel" });
    if (!salesChannels.length) {
      const { result } = await createSalesChannelsWorkflow(req.scope).run({
        input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
      });
      salesChannels = result;
    }

    // Create publishable API key if needed
    let apiKeyToken = existingKeys?.[0]?.token;
    if (!existingKeys?.length) {
      const { result: [publishableApiKey] } = await createApiKeysWorkflow(req.scope).run({
        input: { api_keys: [{ title: "Bar Diamond Store", type: "publishable", created_by: "" }] },
      });
      await linkSalesChannelsToApiKeyWorkflow(req.scope).run({
        input: { id: publishableApiKey.id, add: [salesChannels[0].id] },
      });
      const { data: createdKeys } = await query.graph({
        entity: "api_key",
        fields: ["token"],
        filters: { id: publishableApiKey.id },
      });
      apiKeyToken = createdKeys[0]?.token;
    }

    // Create products if needed
    let productCount = existingProducts?.length || 0;
    if (!existingProducts?.length) {
      // Get or create US region
      let regions = await regionModuleService.listRegions({ name: "United States" });
      if (!regions.length) {
        const { result } = await createRegionsWorkflow(req.scope).run({
          input: { regions: [{ name: "United States", currency_code: "usd", countries: ["us"], payment_providers: ["pp_system_default"] }] },
        });
        regions = result;
      }

      // Get or create shipping profile
      const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({ type: "default" });
      let shippingProfile = shippingProfiles[0];
      if (!shippingProfile) {
        const { result } = await createShippingProfilesWorkflow(req.scope).run({
          input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
        });
        shippingProfile = result[0];
      }

      // Get or create stock location
      const { data: stockLocations } = await query.graph({ entity: "stock_location", fields: ["id"] });
      let stockLocationId = stockLocations?.[0]?.id;
      if (!stockLocationId) {
        const { result } = await createStockLocationsWorkflow(req.scope).run({
          input: { locations: [{ name: "Bar Diamond Warehouse", address: { city: "Parma", country_code: "US", address_1: "PO Box 68" } }] },
        });
        stockLocationId = result[0].id;
        await linkSalesChannelsToStockLocationWorkflow(req.scope).run({
          input: { id: stockLocationId, add: [salesChannels[0].id] },
        });
      }

      // Create categories
      const categoryNames = [...new Set(barDiamondProducts.map((p) => p.category))];
      const { result: categories } = await createProductCategoriesWorkflow(req.scope).run({
        input: { product_categories: categoryNames.map((name) => ({ name, is_active: true })) },
      });
      const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

      // Create products
      const productsToCreate = barDiamondProducts.map((p) => ({
        title: p.title,
        handle: p.handle,
        description: p.description,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile!.id,
        category_ids: [categoryMap.get(p.category)!],
        options: [{ title: "Default", values: ["Default"] }],
        variants: [{ title: "Default", sku: p.sku, options: { Default: "Default" }, prices: [{ amount: p.price, currency_code: "usd" }] }],
        sales_channels: [{ id: salesChannels[0].id }],
      }));

      await createProductsWorkflow(req.scope).run({ input: { products: productsToCreate } });
      productCount = barDiamondProducts.length;
    }

    res.json({
      message: "Setup complete with products",
      publishableApiKey: apiKeyToken,
      productCount,
    });
  } catch (error) {
    console.error("Setup error:", error);
    res.status(500).json({
      error: "Setup failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
