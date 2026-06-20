export const sendUserOrderConfirmation = async (order, userEmail) => {
  if (!userEmail) {
    console.info(`Order ${order._id} shipped; user email is not available.`);
    return;
  }

  console.info(`Order ${order._id} shipped. Notify user at ${userEmail}.`);
export const sendAdminTransferNotification = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.info(
      `Bank transfer order ${order._id} created; ADMIN_EMAIL is not configured.`,
    );
    return;
  }

  console.info(
    `Bank transfer order ${order._id} is awaiting payment. Notify admin at ${adminEmail}.`,
  );
};
