import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function createAdminUser({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const userModuleService = container.resolve(Modules.USER);

  const email = process.env.ADMIN_EMAIL || "admin@bardiamond.com";
  const password = process.env.ADMIN_PASSWORD || "admin123!";

  try {
    // Check if user already exists
    const existingUsers = await userModuleService.listUsers({ email });

    if (existingUsers.length > 0) {
      logger.info(`Admin user ${email} already exists.`);
      return;
    }

    // Create admin user using the user module
    const user = await userModuleService.createUsers({
      email,
      first_name: "Admin",
      last_name: "User",
    });

    logger.info(`Created admin user: ${user.email}`);
    logger.info("Note: You'll need to set the password through the admin UI or reset password flow.");
  } catch (error) {
    logger.error(`Error creating admin user: ${error}`);
    throw error;
  }
}
