"use server";

import { db } from "@/db";
import {
  adminUsers,
  bonuses,
  customers,
  offers,
  orderItems,
  orders,
  payments,
  products,
  settings,
  stockMovements,
} from "@/db/schema";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateOrderNumber, toNumber } from "@/lib/format";
import {
  clearSessionCookie,
  ensureDefaultAdmin,
  findAdminByUsername,
  getSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import {
  bonusLabel,
  computeEffectivePricing,
  computeFreeQuantity,
} from "@/lib/pricing";

/* ================================ ADMIN AUTH ============================== */
export async function loginAction(fd: FormData) {
  const username = String(fd.get("username") || "").trim();
  const password = String(fd.get("password") || "");
  const next = String(fd.get("next") || "/admin");

  await ensureDefaultAdmin();

  if (!username || !password) {
    return { ok: false, error: "Enter username and password" } as const;
  }
  const user = await findAdminByUsername(username);
  if (!user) return { ok: false, error: "Invalid username or password" } as const;
  if (!verifyPassword(password, user.passwordHash)) {
    return { ok: false, error: "Invalid username or password" } as const;
  }
  await setSessionCookie(user.username);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function changePasswordAction(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const current = String(fd.get("currentPassword") || "");
  const next = String(fd.get("newPassword") || "");
  const confirm = String(fd.get("confirmPassword") || "");

  if (!current || !next || !confirm) {
    return { ok: false, error: "All fields are required" } as const;
  }
  if (next.length < 4) {
    return {
      ok: false,
      error: "Password must be at least 4 characters",
    } as const;
  }
  if (next !== confirm) {
    return { ok: false, error: "New passwords do not match" } as const;
  }

  const user = await findAdminByUsername(session.username);
  if (!user || !verifyPassword(current, user.passwordHash)) {
    return { ok: false, error: "Current password is incorrect" } as const;
  }

  await db
    .update(adminUsers)
    .set({ passwordHash: hashPassword(next) })
    .where(eq(adminUsers.id, user.id));

  // Force re-login for security
  await clearSessionCookie();
  redirect("/admin/login?changed=1");
}

/* --------------------------------- SETTINGS ------------------------------- */
export async function saveSettings(fd: FormData) {
  const businessName = String(fd.get("businessName") || "Surgical Supply");
  const logoUrl = String(fd.get("logoUrl") || "") || null;
  const phone = String(fd.get("phone") || "");
  const whatsapp = String(fd.get("whatsapp") || "");
  const address = String(fd.get("address") || "");
  const deliveryCharges = String(fd.get("deliveryCharges") || "0");

  await db
    .insert(settings)
    .values({
      id: 1,
      businessName,
      logoUrl,
      phone,
      whatsapp,
      address,
      deliveryCharges,
    })
    .onConflictDoUpdate({
      target: settings.id,
      set: {
        businessName,
        logoUrl,
        phone,
        whatsapp,
        address,
        deliveryCharges,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/admin/settings");
  revalidatePath("/catalogue");
  revalidatePath("/");
}

/* --------------------------------- PRODUCTS ------------------------------- */
function readProductFields(fd: FormData) {
  return {
    name: String(fd.get("name") || "").trim() || "Untitled",
    brand: String(fd.get("brand") || ""),
    category: String(fd.get("category") || ""),
    sku: String(fd.get("sku") || ""),
    size: String(fd.get("size") || ""),
    packing: String(fd.get("packing") || ""),
    description: String(fd.get("description") || ""),
    supplier: String(fd.get("supplier") || ""),
    imageUrl: String(fd.get("imageUrl") || "") || null,
    costPrice: String(fd.get("costPrice") || "0"),
    sellingPrice: String(fd.get("sellingPrice") || "0"),
    stock: Number(fd.get("stock") || 0),
    minStock: Number(fd.get("minStock") || 5),
    available: fd.get("available") === "on" || fd.get("available") === "true",
    catalogueVisible:
      fd.get("catalogueVisible") === "on" ||
      fd.get("catalogueVisible") === "true",
  };
}

export async function createProduct(fd: FormData) {
  await db.insert(products).values(readProductFields(fd));
  revalidatePath("/admin/products");
  revalidatePath("/catalogue");
}

export async function updateProduct(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  await db.update(products).set(readProductFields(fd)).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/catalogue");
}

export async function deleteProduct(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/catalogue");
}

/* --------------------------------- OFFERS --------------------------------- */
function parseDate(v: FormDataEntryValue | null): Date | null {
  const s = String(v || "").trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d : null;
}

export async function createOffer(fd: FormData) {
  const productId = Number(fd.get("productId"));
  if (!productId) return;
  await db.insert(offers).values({
    productId,
    offerType: String(fd.get("offerType") || "PERCENTAGE"),
    percentage: String(fd.get("percentage") || "0"),
    fixedAmount: String(fd.get("fixedAmount") || "0"),
    dealPrice: String(fd.get("dealPrice") || "0"),
    startDate: parseDate(fd.get("startDate")),
    endDate: parseDate(fd.get("endDate")),
    active: fd.get("active") === "on" || fd.get("active") === "true",
  });
  revalidatePath("/admin/offers");
  revalidatePath("/catalogue");
}

export async function updateOffer(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  await db
    .update(offers)
    .set({
      offerType: String(fd.get("offerType") || "PERCENTAGE"),
      percentage: String(fd.get("percentage") || "0"),
      fixedAmount: String(fd.get("fixedAmount") || "0"),
      dealPrice: String(fd.get("dealPrice") || "0"),
      startDate: parseDate(fd.get("startDate")),
      endDate: parseDate(fd.get("endDate")),
      active: fd.get("active") === "on" || fd.get("active") === "true",
    })
    .where(eq(offers.id, id));
  revalidatePath("/admin/offers");
  revalidatePath("/catalogue");
}

export async function deleteOffer(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  await db.delete(offers).where(eq(offers.id, id));
  revalidatePath("/admin/offers");
  revalidatePath("/catalogue");
}

export async function toggleOffer(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  const [row] = await db.select().from(offers).where(eq(offers.id, id));
  if (!row) return;
  await db.update(offers).set({ active: !row.active }).where(eq(offers.id, id));
  revalidatePath("/admin/offers");
  revalidatePath("/catalogue");
}

/* --------------------------------- BONUSES -------------------------------- */
export async function createBonus(fd: FormData) {
  const productId = Number(fd.get("productId"));
  if (!productId) return;
  await db.insert(bonuses).values({
    productId,
    buyQty: Math.max(1, Number(fd.get("buyQty") || 10)),
    freeQty: Math.max(1, Number(fd.get("freeQty") || 1)),
    startDate: parseDate(fd.get("startDate")),
    endDate: parseDate(fd.get("endDate")),
    active: fd.get("active") === "on" || fd.get("active") === "true",
  });
  revalidatePath("/admin/bonuses");
  revalidatePath("/catalogue");
}

export async function updateBonus(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  await db
    .update(bonuses)
    .set({
      buyQty: Math.max(1, Number(fd.get("buyQty") || 10)),
      freeQty: Math.max(1, Number(fd.get("freeQty") || 1)),
      startDate: parseDate(fd.get("startDate")),
      endDate: parseDate(fd.get("endDate")),
      active: fd.get("active") === "on" || fd.get("active") === "true",
    })
    .where(eq(bonuses.id, id));
  revalidatePath("/admin/bonuses");
  revalidatePath("/catalogue");
}

export async function deleteBonus(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  await db.delete(bonuses).where(eq(bonuses.id, id));
  revalidatePath("/admin/bonuses");
  revalidatePath("/catalogue");
}

export async function toggleBonus(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  const [row] = await db.select().from(bonuses).where(eq(bonuses.id, id));
  if (!row) return;
  await db
    .update(bonuses)
    .set({ active: !row.active })
    .where(eq(bonuses.id, id));
  revalidatePath("/admin/bonuses");
  revalidatePath("/catalogue");
}

/* ---------------------------- ORDER CREATION ------------------------------ */
export type OrderCartItem = {
  productId: number;
  quantity: number; // paid quantity
};

export type PlaceOrderInput = {
  customer: {
    shopName: string;
    ownerName: string;
    mobile: string;
    whatsapp: string;
    address: string;
    area: string;
    city: string;
    deliveryAddress: string;
    notes: string;
  };
  items: OrderCartItem[];
  discount: number;
};

async function nextOrderNumberForToday(): Promise<string> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const rows = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(orders)
    .where(and(gte(orders.createdAt, start), lte(orders.createdAt, end)));
  const count = rows[0]?.c ?? 0;
  return generateOrderNumber(count + 1);
}

export async function placeOrder(input: PlaceOrderInput) {
  const { customer, items, discount } = input;
  if (!items.length) throw new Error("Cart is empty");
  if (!customer.shopName || !customer.ownerName || !customer.mobile) {
    throw new Error("Missing required customer information");
  }

  // Fetch products
  const productIds = items.map((i) => i.productId);
  const prodRows = await db
    .select()
    .from(products)
    .where(sql`${products.id} = ANY(${productIds})`);
  const byId = new Map(prodRows.map((p) => [p.id, p]));

  // Fetch active offers / bonuses for these products
  const offerRows = await db
    .select()
    .from(offers)
    .where(sql`${offers.productId} = ANY(${productIds})`);
  const bonusRows = await db
    .select()
    .from(bonuses)
    .where(sql`${bonuses.productId} = ANY(${productIds})`);

  const offerByProduct = new Map<number, (typeof offerRows)[number]>();
  for (const o of offerRows) offerByProduct.set(o.productId, o);
  const bonusByProduct = new Map<number, (typeof bonusRows)[number]>();
  for (const b of bonusRows) bonusByProduct.set(b.productId, b);

  // Create customer record
  const [cust] = await db
    .insert(customers)
    .values({
      shopName: customer.shopName,
      ownerName: customer.ownerName,
      mobile: customer.mobile,
      whatsapp: customer.whatsapp || customer.mobile,
      address: customer.address,
      area: customer.area,
      city: customer.city,
    })
    .returning();

  // Get delivery charge from settings
  const st = await db.select().from(settings).where(eq(settings.id, 1));
  const deliveryCharges = toNumber(st[0]?.deliveryCharges ?? "0");

  // Compute totals with offers + bonuses
  let subtotal = 0;
  let costTotal = 0;

  const preparedItems = items.map((it) => {
    const p = byId.get(it.productId);
    if (!p) throw new Error(`Product ${it.productId} not found`);

    const pricing = computeEffectivePricing(
      p.sellingPrice,
      offerByProduct.get(p.id) ?? null,
    );
    const bonus = bonusByProduct.get(p.id) ?? null;
    const freeQty = computeFreeQuantity(it.quantity, bonus);
    const bLabel = bonusLabel(bonus) ?? "";

    const unit = pricing.effectivePrice;
    const normal = pricing.normalPrice;
    const cost = toNumber(p.costPrice);
    const line = unit * it.quantity;

    subtotal += line;
    // Cost includes free items too (they still cost the business)
    costTotal += cost * (it.quantity + freeQty);

    return {
      product: p,
      quantity: it.quantity,
      freeQuantity: freeQty,
      unitPrice: unit,
      normalPrice: normal,
      costPrice: cost,
      lineTotal: line,
      offerLabel: pricing.offerLabel ?? "",
      bonusLabel: bLabel,
    };
  });

  const disc = Math.max(0, discount || 0);
  const total = Math.max(0, subtotal + deliveryCharges - disc);
  const profit = subtotal - costTotal - disc;

  const orderNumber = await nextOrderNumberForToday();

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      customerId: cust.id,
      deliveryAddress: customer.deliveryAddress || customer.address,
      notes: customer.notes,
      subtotal: String(subtotal),
      deliveryCharges: String(deliveryCharges),
      discount: String(disc),
      total: String(total),
      costTotal: String(costTotal),
      profit: String(profit),
      status: "NEW",
      paymentStatus: "UNPAID",
      stockDeducted: false,
    })
    .returning();

  await db.insert(orderItems).values(
    preparedItems.map((it) => ({
      orderId: order.id,
      productId: it.product.id,
      nameSnapshot: it.product.name,
      brandSnapshot: it.product.brand,
      packingSnapshot: it.product.packing,
      normalPrice: String(it.normalPrice),
      unitPrice: String(it.unitPrice),
      costPrice: String(it.costPrice),
      quantity: it.quantity,
      freeQuantity: it.freeQuantity,
      offerLabel: it.offerLabel,
      bonusLabel: it.bonusLabel,
      lineTotal: String(it.lineTotal),
    })),
  );

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { orderNumber: order.orderNumber, id: order.id };
}

/* ---------------------------- STATUS TRANSITIONS -------------------------- */
async function deductStock(orderId: number) {
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  for (const it of items) {
    const totalUnits = it.quantity + it.freeQuantity;
    await db
      .update(products)
      .set({ stock: sql`${products.stock} - ${totalUnits}` })
      .where(eq(products.id, it.productId));
    await db.insert(stockMovements).values({
      productId: it.productId,
      orderId,
      change: -totalUnits,
      reason:
        it.freeQuantity > 0
          ? `Order confirmed (${it.quantity} paid + ${it.freeQuantity} free)`
          : `Order confirmed`,
    });
  }
  await db
    .update(orders)
    .set({ stockDeducted: true })
    .where(eq(orders.id, orderId));
}

async function restoreStock(orderId: number) {
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  for (const it of items) {
    const totalUnits = it.quantity + it.freeQuantity;
    await db
      .update(products)
      .set({ stock: sql`${products.stock} + ${totalUnits}` })
      .where(eq(products.id, it.productId));
    await db.insert(stockMovements).values({
      productId: it.productId,
      orderId,
      change: totalUnits,
      reason: `Order cancelled - stock restored`,
    });
  }
  await db
    .update(orders)
    .set({ stockDeducted: false })
    .where(eq(orders.id, orderId));
}

export async function changeOrderStatus(fd: FormData) {
  const id = Number(fd.get("id"));
  const status = String(fd.get("status") || "") as
    | "NEW"
    | "CONFIRMED"
    | "PROCESSING"
    | "READY"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

  const [existing] = await db.select().from(orders).where(eq(orders.id, id));
  if (!existing) return;

  if (
    !existing.stockDeducted &&
    (status === "CONFIRMED" ||
      status === "PROCESSING" ||
      status === "READY" ||
      status === "OUT_FOR_DELIVERY" ||
      status === "DELIVERED")
  ) {
    await deductStock(id);
  }
  if (existing.stockDeducted && status === "CANCELLED") {
    await restoreStock(id);
  }

  await db.update(orders).set({ status }).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function addPayment(fd: FormData) {
  const id = Number(fd.get("id"));
  const amount = Number(fd.get("amount") || 0);
  const method = String(fd.get("method") || "CASH");
  const note = String(fd.get("note") || "");
  if (!id || amount <= 0) return;

  await db.insert(payments).values({
    orderId: id,
    amount: String(amount),
    method,
    note,
  });

  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return;
  const paidRows = await db
    .select({ s: sql<string>`COALESCE(SUM(${payments.amount}),0)` })
    .from(payments)
    .where(eq(payments.orderId, id));
  const paid = toNumber(paidRows[0]?.s ?? "0");
  const total = toNumber(order.total);
  const paymentStatus =
    paid >= total ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";

  await db
    .update(orders)
    .set({ paid: String(paid), paymentStatus })
    .where(eq(orders.id, id));

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/admin/orders`);
}

export async function markPaid(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return;
  const total = toNumber(order.total);
  const currentPaid = toNumber(order.paid);
  const remaining = total - currentPaid;
  if (remaining > 0) {
    await db.insert(payments).values({
      orderId: id,
      amount: String(remaining),
      method: "CASH",
      note: "Marked paid",
    });
  }
  await db
    .update(orders)
    .set({ paid: String(total), paymentStatus: "PAID" })
    .where(eq(orders.id, id));
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/admin/orders`);
}

export async function deleteOrder(fd: FormData) {
  const id = Number(fd.get("id"));
  if (!id) return;
  const [existing] = await db.select().from(orders).where(eq(orders.id, id));
  if (existing?.stockDeducted) {
    await restoreStock(id);
  }
  await db.delete(orders).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

/* --------------------------------- REORDER -------------------------------- */
export async function fetchOrderItemsForReorder(orderId: number) {
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const productIds = items.map((i) => i.productId);
  if (productIds.length === 0) return [];
  const prods = await db
    .select()
    .from(products)
    .where(sql`${products.id} = ANY(${productIds})`);
  const byId = new Map(prods.map((p) => [p.id, p]));

  return items
    .map((it) => {
      const p = byId.get(it.productId);
      if (!p) return null;
      return {
        productId: p.id,
        name: p.name,
        brand: p.brand,
        packing: p.packing,
        imageUrl: p.imageUrl,
        unitPrice: toNumber(p.sellingPrice),
        maxStock: p.stock,
        quantity: it.quantity,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
}

/* -------------------- READ HELPERS FOR CUSTOMER HISTORY ------------------- */
export async function getRecentOrders(limit = 20) {
  return db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}
