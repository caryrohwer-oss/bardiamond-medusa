import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductsWorkflow,
  createProductCategoriesWorkflow,
  createRegionsWorkflow,
  createShippingProfilesWorkflow,
  createSalesChannelsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows";

// Bar Diamond products from WooCommerce
const barDiamondProducts = [
  {
    title: "Freeze-Dried Rumen Microbial Suspension, Makes 1 Liter (#FDRF)",
    handle: "fdrf-freeze-dried-rumen",
    description: "Freeze-dried rumen microbial suspension for long-term storage. Reconstitutes with warm water for immediate use.",
    price: 10000,
    sku: "FDRF",
    category: "Rumen Fluid",
    image: "https://bardiamond.com/wp-content/uploads/2026/01/FDRF-dry.png",
  },
  {
    title: "Fresh Rumen Fluid, 1 liter (#FRF)",
    handle: "frf-fresh-rumen-fluid",
    description: "Fresh rumen fluid for veterinary and research use.",
    price: 25000,
    sku: "FRF",
    category: "Rumen Fluid",
  },
  {
    title: "Sterilized Rumen Fluid, 180 mls (#SRF)",
    handle: "srf-sterilized-rumen-fluid",
    description: "Sterilized rumen fluid for laboratory use.",
    price: 25000,
    sku: "SRF",
    category: "Rumen Fluid",
  },
  {
    title: "#1C 4\" Rumen Cannula, Rolled inner flange",
    handle: "1c-rumen-cannula",
    description: "4 inch rumen cannula with rolled inner flange for cattle.",
    price: 32500,
    sku: "1C",
    category: "Rumen Cannulas",
  },
  {
    title: "#1C5 5\" Rumen Cannula with rolled inner flange",
    handle: "1c5-rumen-cannula",
    description: "5 inch rumen cannula with rolled inner flange for larger cattle.",
    price: 35000,
    sku: "1C5",
    category: "Rumen Cannulas",
  },
  {
    title: "#2C 4\" Rumen Cannula with inner flange like outer flange",
    handle: "2c-rumen-cannula",
    description: "4 inch rumen cannula with matching inner and outer flanges.",
    price: 32500,
    sku: "2C",
    category: "Rumen Cannulas",
  },
  {
    title: "#3C 4\" Rumen Cannula, X-deep with inner flange like outer flange",
    handle: "3c-rumen-cannula",
    description: "4 inch extra-deep rumen cannula with matching flanges.",
    price: 33500,
    sku: "3C",
    category: "Rumen Cannulas",
  },
  {
    title: "#4C 3\" Rumen Cannula with inner flange like outer flange",
    handle: "4c-rumen-cannula",
    description: "3 inch rumen cannula with matching inner and outer flanges.",
    price: 32500,
    sku: "4C",
    category: "Rumen Cannulas",
  },
  {
    title: "#5C Rumen Cannula",
    handle: "5c-rumen-cannula",
    description: "Standard rumen cannula for cattle.",
    price: 30000,
    sku: "5C",
    category: "Rumen Cannulas",
  },
  {
    title: "#6C Rumen Cannula",
    handle: "6c-rumen-cannula",
    description: "Standard rumen cannula for cattle.",
    price: 30000,
    sku: "6C",
    category: "Rumen Cannulas",
  },
  {
    title: "#7C Rumen Cannula",
    handle: "7c-rumen-cannula",
    description: "Standard rumen cannula for cattle.",
    price: 30000,
    sku: "7C",
    category: "Rumen Cannulas",
  },
  {
    title: "#8C Rumen Cannula",
    handle: "8c-rumen-cannula",
    description: "Standard rumen cannula for cattle.",
    price: 30000,
    sku: "8C",
    category: "Rumen Cannulas",
  },
  {
    title: "#9C 4\" Rumen Cannula with mirrored flanges",
    handle: "9c-rumen-cannula",
    description: "4 inch rumen cannula with mirrored flanges.",
    price: 32500,
    sku: "9C",
    category: "Rumen Cannulas",
  },
  {
    title: "#9CX 4\" Rumen Cannula with mirrored flanges, Extra Deep",
    handle: "9cx-rumen-cannula",
    description: "4 inch extra-deep rumen cannula with mirrored flanges.",
    price: 33500,
    sku: "9CX",
    category: "Rumen Cannulas",
  },
  {
    title: "#10C 3\" Rubber Cannula",
    handle: "10c-rubber-cannula",
    description: "3 inch rubber cannula.",
    price: 20000,
    sku: "10C",
    category: "Rubber Cannulas",
  },
  {
    title: "#11C 2\" Rubber Cannula",
    handle: "11c-rubber-cannula",
    description: "2 inch rubber cannula.",
    price: 20000,
    sku: "11C",
    category: "Rubber Cannulas",
  },
  {
    title: "#11E-C Esophageal Cannula - Cattle",
    handle: "11e-c-esophageal-cannula",
    description: "Esophageal cannula designed for cattle.",
    price: 15000,
    sku: "11E-C",
    category: "Esophageal Cannulas",
  },
  {
    title: "#11E-S Esophageal Cannula - Sheep",
    handle: "11e-s-esophageal-cannula",
    description: "Esophageal cannula designed for sheep.",
    price: 15000,
    sku: "11E-S",
    category: "Esophageal Cannulas",
  },
  {
    title: "#RT Rumen Fluid Sampler Tube",
    handle: "rt-rumen-sampler-tube",
    description: "Rumen fluid sampler tube for collection and analysis.",
    price: 16000,
    sku: "RT",
    category: "Accessories",
  },
  {
    title: "#1W Washer for #1C",
    handle: "1w-washer",
    description: "Replacement washer for #1C cannula.",
    price: 9500,
    sku: "1W",
    category: "Washers",
  },
  {
    title: "#1W5 Washer for #1C5 Cannula",
    handle: "1w5-washer",
    description: "Replacement washer for #1C5 cannula.",
    price: 9500,
    sku: "1W5",
    category: "Washers",
  },
  {
    title: "#2-3W Washer for both #2C and #3C",
    handle: "2-3w-washer",
    description: "Replacement washer compatible with #2C and #3C cannulas.",
    price: 9500,
    sku: "2-3W",
    category: "Washers",
  },
  {
    title: "#4W Washer for #4C Cannula",
    handle: "4w-washer",
    description: "Replacement washer for #4C cannula.",
    price: 9500,
    sku: "4W",
    category: "Washers",
  },
  {
    title: "#8W Washer for #8C",
    handle: "8w-washer",
    description: "Replacement washer for #8C cannula.",
    price: 9500,
    sku: "8W",
    category: "Washers",
  },
  {
    title: "#10W Washer for #10C",
    handle: "10w-washer",
    description: "Replacement washer for #10C cannula.",
    price: 9500,
    sku: "10W",
    category: "Washers",
  },
  {
    title: "#11W Washer for #11C",
    handle: "11w-washer",
    description: "Replacement washer for #11C cannula.",
    price: 9000,
    sku: "11W",
    category: "Washers",
  },
];

export default async function seedBarDiamond({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const regionModuleService = container.resolve(Modules.REGION);
  const link = container.resolve(ContainerRegistrationKeys.LINK);

  logger.info("Starting Bar Diamond product seeding...");

  // Check if products already exist
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
  });

  if (existingProducts?.length > 0) {
    logger.info(`Products already exist (${existingProducts.length} found). Skipping seed.`);
    return;
  }

  // Get or create sales channel
  let salesChannels = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!salesChannels.length) {
    logger.info("Creating sales channel...");
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [{ name: "Default Sales Channel" }],
      },
    });
    salesChannels = result;
  }

  // Get or create US region
  let regions = await regionModuleService.listRegions({ name: "United States" });

  if (!regions.length) {
    logger.info("Creating US region...");
    const { result } = await createRegionsWorkflow(container).run({
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
    logger.info("Creating shipping profile...");
    const { result } = await createShippingProfilesWorkflow(container).run({
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
    logger.info("Creating stock location...");
    const { result } = await createStockLocationsWorkflow(container).run({
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

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [salesChannels[0].id],
      },
    });

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  }

  // Create categories
  logger.info("Creating product categories...");
  const categoryNames = [...new Set(barDiamondProducts.map((p) => p.category))];
  const { result: categories } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: categoryNames.map((name) => ({
        name,
        is_active: true,
      })),
    },
  });

  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));
  logger.info(`Created ${categories.length} categories: ${categoryNames.join(", ")}`);

  // Create products
  logger.info(`Creating ${barDiamondProducts.length} products...`);
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
        manage_inventory: true,
        prices: [
          { amount: p.price, currency_code: "usd" },
        ],
      },
    ],
    sales_channels: [{ id: salesChannels[0].id }],
  }));

  const { result: createdProducts } = await createProductsWorkflow(container).run({
    input: { products: productsToCreate },
  });

  logger.info(`Created ${createdProducts.length} products`);

  // Set inventory levels
  logger.info("Setting inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  if (inventoryItems?.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryItems.map((item) => ({
          location_id: stockLocation.id,
          stocked_quantity: 100,
          inventory_item_id: item.id,
        })),
      },
    });
    logger.info(`Set inventory for ${inventoryItems.length} items`);
  }

  logger.info("Bar Diamond product seeding complete!");
}
