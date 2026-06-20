import nodemailer from "nodemailer";

let transporter;

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) =>
  new Date(value || Date.now()).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getShippingAddressText = (shippingAddress = {}) =>
  [
    shippingAddress.street,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.zipCode,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(", ") || "Khong co thong tin";

const buildOrderRows = (orderItems = []) =>
  orderItems
    .map((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;

      return `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(item.name || "San pham")}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(price)}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(quantity * price)}</td>
        </tr>
      `;
    })
    .join("");

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;
  if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
    console.warn("Missing MAIL_HOST, MAIL_PORT, MAIL_USER or MAIL_PASS");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT),
    secure: Number(MAIL_PORT) === 465,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });

  return transporter;
};

export const sendAdminTransferNotification = async (order) => {
  try {
    const mailer = getTransporter();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!mailer || !adminEmail) {
      return false;
    }

    const userName = order?.userId?.name || "Khach hang";
    const userEmail = order?.userId?.email || "Khong co email";
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;color:#1f2937;">
        <h2 style="margin-bottom:8px;">Thong bao don hang moi</h2>
        <p>He thong vua ghi nhan mot don hang moi.</p>
        <p><strong>Ma don hang:</strong> ${escapeHtml(order?._id)}</p>
        <p><strong>Ten nguoi dung:</strong> ${escapeHtml(userName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(userEmail)}</p>
        <p><strong>Tong tien:</strong> ${formatCurrency(order?.totalPrice)}</p>
        <p><strong>Ngay dat:</strong> ${formatDate(order?.createdAt)}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">San pham</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:center;">SL</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:right;">Don gia</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:right;">Thanh tien</th>
            </tr>
          </thead>
          <tbody>${buildOrderRows(order?.orderItems)}</tbody>
        </table>
      </div>
    `;

    await mailer.sendMail({
      from: process.env.MAIL_USER,
      to: adminEmail,
      subject: `Don hang moi #${order?._id}`,
      html,
    });

    return true;
  } catch (error) {
    console.error("Failed to send admin transfer notification:", error.message);
    return false;
  }
};

export const sendUserOrderConfirmation = async (order, userEmail) => {
  try {
    const mailer = getTransporter();
    if (!mailer || !userEmail) {
      return false;
    }

    const userName = order?.userId?.name || "ban";
    const shippingAddress = getShippingAddressText(order?.shippingAddress);
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;color:#1f2937;">
        <h2 style="margin-bottom:8px;">Cam on ban da dat hang</h2>
        <p>Xin chao <strong>${escapeHtml(userName)}</strong>, cam on ban da mua hang tai Shop Sneaker.</p>
        <p>Don hang <strong>#${escapeHtml(order?._id)}</strong> da duoc tiep nhan vao ${formatDate(order?.createdAt)}.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">San pham</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:center;">SL</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:right;">Don gia</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:right;">Thanh tien</th>
            </tr>
          </thead>
          <tbody>${buildOrderRows(order?.orderItems)}</tbody>
        </table>
        <p style="margin-top:16px;"><strong>Tong tien:</strong> ${formatCurrency(order?.totalPrice)}</p>
        <p><strong>Dia chi giao hang:</strong> ${escapeHtml(shippingAddress)}</p>
      </div>
    `;

    await mailer.sendMail({
      from: process.env.MAIL_USER,
      to: userEmail,
      subject: `Xac nhan don hang #${order?._id}`,
      html,
    });

    return true;
  } catch (error) {
    console.error("Failed to send user order confirmation:", error.message);
    return false;
  }
};

export default {
  sendAdminTransferNotification,
  sendUserOrderConfirmation,
};
