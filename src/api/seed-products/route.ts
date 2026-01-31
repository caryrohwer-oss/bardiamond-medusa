import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
import {
  createProductsWorkflow,
  createProductCategoriesWorkflow,
  createRegionsWorkflow,
  createShippingProfilesWorkflow,
  createSalesChannelsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

// Bar Diamond products from WooCommerce
const barDiamondProducts = [
  {
    title: "Freeze-Dried Rumen Microbial Suspension, Makes 1 Liter (#FDRF)",
    handle: "fdrf-freeze-dried-rumen",
    description: "Freeze-dried rumen microbial suspension for long-term storage. Reconstitutes with warm water for immediate use.",
    price: 10000, // $100.00 in cents
    sku: "FDRF",
    category: "Rumen Fluid",
    image: "https://bardiamond.com/wp-content/uploads/2026/01/FDRF-dry.png",
  },
  {
    title: "Fresh Rumen Fluid, 1 liter (#FRF)",
    handle: "frf-fresh-rumen-fluid",
    description: "Fresh rumen fluid for veterinary and research use.",
    price: 25000, // $250.00
    sku: "FRF",
    category: "Rumen Fluid",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/fresh-rumen-fluid.jpg",
  },
  {
    title: "Sterilized Rumen Fluid, 180 mls (#SRF)",
    handle: "srf-sterilized-rumen-fluid",
    description: "Sterilized rumen fluid for laboratory use.",
    price: 25000, // $250.00
    sku: "SRF",
    category: "Rumen Fluid",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/sterilized-rumen-fluid.jpg",
  },
  {
    title: "#1C 4\" Rumen Cannula, Rolled inner flange",
    handle: "1c-rumen-cannula",
    description: "4 inch rumen cannula with rolled inner flange for cattle.",
    price: 32500, // $325.00
    sku: "1C",
    category: "Rumen Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/1C-cannula.jpg",
  },
  {
    title: "#1C5 5\" Rumen Cannula with rolled inner flange",
    handle: "1c5-rumen-cannula",
    description: "5 inch rumen cannula with rolled inner flange for larger cattle.",
    price: 35000, // $350.00
    sku: "1C5",
    category: "Rumen Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/1C5-cannula.jpg",
  },
  {
    title: "#2C 4\" Rumen Cannula with inner flange like outer flange",
    handle: "2c-rumen-cannula",
    description: "4 inch rumen cannula with matching inner and outer flanges.",
    price: 32500, // $325.00
    sku: "2C",
    category: "Rumen Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/2C-cannula.jpg",
  },
  {
    title: "#3C 4\" Rumen Cannula, X-deep with inner flange like outer flange",
    handle: "3c-rumen-cannula",
    description: "4 inch extra-deep rumen cannula with matching flanges.",
    price: 33500, // $335.00
    sku: "3C",
    category: "Rumen Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/3C-cannula.jpg",
  },
  {
    title: "#4C 3\" Rumen Cannula with inner flange like outer flange",
    handle: "4c-rumen-cannula",
    description: "3 inch rumen cannula with matching inner and outer flanges.",
    price: 32500, // $325.00
    sku: "4C",
    category: "Rumen Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/4C-cannula.jpg",
  },
  {
    title: "#5C Rumen Cannula",
    handle: "5c-rumen-cannula",
    description: "Standard rumen cannula for cattle.",
    price: 30000, // $300.00
    sku: "5C",
    category: "Rumen Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/5C-cannula.jpg",
  },
  {
    title: "#6C Rumen Cannula",
    handle: "6c-rumen-cannula",
    description: "Standard rumen cannula for cattle.",
    price: 30000, // $300.00
    sku: "6C",
    category: "Rumen Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/6C-cannula.jpg",
  },
  {
    title: "#7C Rumen Cannula",
    handle: "7c-rumen-cannula",
    description: "Standard rumen cannula for cattle.",
    price: 30000, // $300.00
    sku: "7C",
    category: "Rumen Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/7C-cannula.jpg",
  },
  {
    title: "#8C Rumen Cannula",
    handle: "8c-rumen-cannula",
    description: "Standard rumen cannula for cattle.",
    price: 30000, // $300.00
    sku: "8C",
    category: "Rumen Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/8C-cannula.jpg",
  },
  {
    title: "#9C 4\" Rumen Cannula with mirrored flanges",
    handle: "9c-rumen-cannula",
    description: "4 inch rumen cannula with mirrored flanges.",
    price: 32500, // $325.00
    sku: "9C",
    category: "Rumen Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/9C-cannula.jpg",
  },
  {
    title: "#9CX 4\" Rumen Cannula with mirrored flanges, Extra Deep",
    handle: "9cx-rumen-cannula",
    description: "4 inch extra-deep rumen cannula with mirrored flanges.",
    price: 33500, // $335.00
    sku: "9CX",
    category: "Rumen Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/9CX-cannula.jpg",
  },
  {
    title: "#10C 3\" Rubber Cannula",
    handle: "10c-rubber-cannula",
    description: "3 inch rubber cannula.",
    price: 20000, // $200.00
    sku: "10C",
    category: "Rubber Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/10C-cannula.jpg",
  },
  {
    title: "#11C 2\" Rubber Cannula",
    handle: "11c-rubber-cannula",
    description: "2 inch rubber cannula.",
    price: 20000, // $200.00
    sku: "11C",
    category: "Rubber Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/11C-cannula.jpg",
  },
  {
    title: "#11E-C Esophageal Cannula - Cattle",
    handle: "11e-c-esophageal-cannula",
    description: "Esophageal cannula designed for cattle.",
    price: 15000, // $150.00
    sku: "11E-C",
    category: "Esophageal Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/11E-C-cannula.jpg",
  },
  {
    title: "#11E-S Esophageal Cannula - Sheep",
    handle: "11e-s-esophageal-cannula",
    description: "Esophageal cannula designed for sheep.",
    price: 15000, // $150.00
    sku: "11E-S",
    category: "Esophageal Cannulas",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/11E-S-cannula.jpg",
  },
  {
    title: "#RT Rumen Fluid Sampler Tube",
    handle: "rt-rumen-sampler-tube",
    description: "Rumen fluid sampler tube for collection and analysis.",
    price: 16000, // $160.00
    sku: "RT",
    category: "Accessories",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/RT-sampler.jpg",
  },
  {
    title: "#1W Washer for #1C",
    handle: "1w-washer",
    description: "Replacement washer for #1C cannula.",
    price: 9500, // $95.00
    sku: "1W",
    category: "Washers",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/washer.jpg",
  },
  {
    title: "#1W5 Washer for #1C5 Cannula",
    handle: "1w5-washer",
    description: "Replacement washer for #1C5 cannula.",
    price: 9500, // $95.00
    sku: "1W5",
    category: "Washers",
    image: "https://bardiamond.com/wp-content/uploads/2025/08/20250812_163955-scaled.jpg",
  },
  {
    title: "#2-3W Washer for both #2C and #3C",
    handle: "2-3w-washer",
    description: "Replacement washer compatible with #2C and #3C cannulas.",
    price: 9500, // $95.00
    sku: "2-3W",
    category: "Washers",
    image: "https://bardiamond.com/wp-content/uploads/2025/07/20250708_133731-rotated.jpg",
  },
  {
    title: "#4W Washer for #4C Cannula",
    handle: "4w-washer",
    description: "Replacement washer for #4C cannula.",
    price: 9500, // $95.00
    sku: "4W",
    category: "Washers",
    image: "https://bardiamond.com/wp-content/uploads/2025/01/4W-3-rotated-fixed.png",
  },
  {
    title: "#8W Washer for #8C",
    handle: "8w-washer",
    description: "Replacement washer for #8C cannula.",
    price: 9500, // $95.00
    sku: "8W",
    category: "Washers",
    image: "https://bardiamond.com/wp-content/uploads/2025/07/20250708_124304-2-rotated.jpg",
  },
  {
    title: "#10W Washer for #10C",
    handle: "10w-washer",
    description: "Replacement washer for #10C cannula.",
    price: 9500, // $95.00
    sku: "10W",
    category: "Washers",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/washer.jpg",
  },
  {
    title: "#11W Washer for #11C",
    handle: "11w-washer",
    description: "Replacement washer for #11C cannula.",
    price: 9000, // $90.00
    sku: "11W",
    category: "Washers",
    image: "https://bardiamond.com/wp-content/uploads/2020/03/washer.jpg",
  },
];

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = req.scope.resolve(Modules.SALES_CHANNEL);
  const regionModuleService = req.scope.resolve(Modules.REGION);
  const fulfillmentModuleService = req.scope.resolve(Modules.FULFILLMENT);
  const storeModuleService = req.scope.resolve(Modules.STORE);

  try {
    // Check if products already exist
    const { data: existingProducts } = await query.graph({
      entity: "product",
      fields: ["id"],
    });

    if (existingProducts?.length > 0) {
      return res.json({
        message: "Products already seeded",
        productCount: existingProducts.length,
      });
    }

    // Get or create sales channel
    let salesChannels = await salesChannelModuleService.listSalesChannels({
      name: "Default Sales Channel",
    });

    if (!salesChannels.length) {
      const { result } = await createSalesChannelsWorkflow(req.scope).run({
        input: {
          salesChannelsData: [{ name: "Default Sales Channel" }],
        },
      });
      salesChannels = result;
    }

    // Get or create region (US with USD)
    let regions = await regionModuleService.listRegions({ name: "United States" });

    if (!regions.length) {
      const { result } = await createRegionsWorkflow(req.scope).run({
        input: {
          regions: [
            {
              name: "United States",
              currency_code: "usd",
              countries: ["us"],
              payment_providers: ["pp_system_default"],
            },
          ],
        },
      });
      regions = result;
    }

    // Get or create shipping profile
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
      type: "default",
    });
    let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

    if (!shippingProfile) {
      const { result } = await createShippingProfilesWorkflow(req.scope).run({
        input: {
          data: [{ name: "Default Shipping Profile", type: "default" }],
        },
      });
      shippingProfile = result[0];
    }

    // Get or create stock location
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
    });

    let stockLocation = stockLocations?.[0];

    if (!stockLocation) {
      const { result } = await createStockLocationsWorkflow(req.scope).run({
        input: {
          locations: [
            {
              name: "Bar Diamond Warehouse",
              address: {
                city: "Parma",
                country_code: "US",
                address_1: "PO Box 68",
              },
            },
          ],
        },
      });
      stockLocation = result[0];

      // Link stock location to sales channel
      await linkSalesChannelsToStockLocationWorkflow(req.scope).run({
        input: {
          id: stockLocation.id,
          add: [salesChannels[0].id],
        },
      });
    }

    // Create product categories
    const categoryNames = [...new Set(barDiamondProducts.map((p) => p.category))];
    const { result: categories } = await createProductCategoriesWorkflow(req.scope).run({
      input: {
        product_categories: categoryNames.map((name) => ({
          name,
          is_active: true,
        })),
      },
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
      images: p.image ? [{ url: p.image }] : [],
      options: [{ title: "Default", values: ["Default"] }],
      variants: [
        {
          title: "Default",
          sku: p.sku,
          options: { Default: "Default" },
          prices: [
            { amount: p.price, currency_code: "usd" },
            { amount: p.price, region_id: regions[0].id },
          ],
        },
      ],
      sales_channels: [{ id: salesChannels[0].id }],
    }));

    await createProductsWorkflow(req.scope).run({
      input: { products: productsToCreate },
    });

    res.json({
      message: "Products seeded successfully",
      productCount: barDiamondProducts.length,
      categories: categoryNames,
      region: regions[0].name,
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({
      error: "Seeding failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
