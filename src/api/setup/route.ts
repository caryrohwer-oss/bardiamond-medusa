import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = req.scope.resolve(Modules.SALES_CHANNEL);

  try {
    // Check if publishable API key already exists
    const { data: existingKeys } = await query.graph({
      entity: "api_key",
      fields: ["id", "token", "title"],
      filters: {
        type: "publishable",
      },
    });

    if (existingKeys?.length > 0) {
      return res.json({
        message: "Initialization already complete",
        publishableApiKey: existingKeys[0].token,
        title: existingKeys[0].title,
      });
    }

    // Get or create default sales channel
    let salesChannels = await salesChannelModuleService.listSalesChannels({
      name: "Default Sales Channel",
    });

    if (!salesChannels.length) {
      const { result: salesChannelResult } = await createSalesChannelsWorkflow(
        req.scope
      ).run({
        input: {
          salesChannelsData: [
            {
              name: "Default Sales Channel",
            },
          ],
        },
      });
      salesChannels = salesChannelResult;
    }

    // Create publishable API key
    const {
      result: [publishableApiKey],
    } = await createApiKeysWorkflow(req.scope).run({
      input: {
        api_keys: [
          {
            title: "Bar Diamond Store",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    // Link sales channel to API key
    await linkSalesChannelsToApiKeyWorkflow(req.scope).run({
      input: {
        id: publishableApiKey.id,
        add: [salesChannels[0].id],
      },
    });

    // Get the token from the created key
    const { data: createdKeys } = await query.graph({
      entity: "api_key",
      fields: ["id", "token", "title"],
      filters: {
        id: publishableApiKey.id,
      },
    });

    res.json({
      message: "Initialization complete",
      publishableApiKey: createdKeys[0]?.token,
      title: createdKeys[0]?.title,
      salesChannelId: salesChannels[0].id,
    });
  } catch (error) {
    console.error("Initialization error:", error);
    res.status(500).json({
      error: "Initialization failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
