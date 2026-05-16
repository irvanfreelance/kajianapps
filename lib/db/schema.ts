import {
  pgTable,
  bigserial,
  varchar,
  timestamp,
  integer,
  text,
  numeric,
  bigint,
  boolean,
  index
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userCode: varchar('user_code', { length: 20 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }),
  gender: varchar('gender', { length: 20 }),
  job: varchar('job', { length: 20 }),
  yearBorn: varchar('year_born', { length: 20 }),
  joinedDate: varchar('joined_date', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_users_email').on(table.email)
]);

export const admins = pgTable('admins', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('SUPERADMIN'),
  status: varchar('status', { length: 20 }).default('ACTIVE'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_admins_email').on(table.email)
]);

export const kajian = pgTable('kajian', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  title: varchar('title', { length: 150 }).notNull(),
  ustadz: varchar('ustadz', { length: 100 }).notNull(),
  dateDisplay: varchar('date_display', { length: 50 }).notNull(),
  timeDisplay: varchar('time_display', { length: 20 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  price: integer('price').default(0),
  spot: integer('spot').default(0),
  filled: integer('filled').default(0),
  image: text('image'),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description'),
  location: varchar('location', { length: 150 }),
  urlZoom: varchar('url_zoom', { length: 255 }),
  urlYoutube: varchar('url_youtube', { length: 255 }),
  slug: varchar('slug', { length: 200 }).unique(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_kajian_category').on(table.category),
  index('idx_kajian_slug').on(table.slug)
]);

export const products = pgTable('products', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  price: integer('price').notNull(),
  oldPrice: integer('old_price'),
  stock: integer('stock').default(0),
  image: text('image'),
  category: varchar('category', { length: 50 }).notNull(),
  rating: numeric('rating', { precision: 3, scale: 1 }).default('0.0'),
  sold: integer('sold').default(0),
  description: text('description'),
  slug: varchar('slug', { length: 200 }).unique(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_products_category').on(table.category),
  index('idx_products_slug').on(table.slug)
]);

export const kajianRegistrations = pgTable('kajian_registrations', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  kajianId: bigint('kajian_id', { mode: 'number' }).notNull().references(() => kajian.id, { onDelete: 'cascade' }),
  paymentMethodId: bigint('payment_method_id', { mode: 'number' }).references(() => paymentMethods.id, { onDelete: 'set null' }),
  vendorPaymentId: varchar('vendor_payment_id', { length: 255 }),
  paymentUrl: text('payment_url'),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  isCheckoutSent: boolean('is_checkout_sent').default(false),
  isPaidSent: boolean('is_paid_sent').default(false),
  paidAmount: integer('paid_amount').default(0),
  isApproved: boolean('is_approved').default(false),
  registeredAt: timestamp('registered_at').defaultNow()
}, (table) => [
  index('idx_kajian_regs_user_id').on(table.userId),
  index('idx_kajian_regs_kajian_id').on(table.kajianId)
]);

export const orders = pgTable('orders', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  orderCode: varchar('order_code', { length: 50 }).unique().notNull(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  paymentMethodId: bigint('payment_method_id', { mode: 'number' }).references(() => paymentMethods.id, { onDelete: 'set null' }),
  vendorPaymentId: varchar('vendor_payment_id', { length: 255 }),
  paymentUrl: text('payment_url'),
  isCheckoutSent: boolean('is_checkout_sent').default(false),
  isPaidSent: boolean('is_paid_sent').default(false),
  orderDate: varchar('order_date', { length: 50 }).notNull(),
  total: integer('total').notNull(),
  shippingAddress: text('shipping_address'),
  provinceId: varchar('province_id', { length: 20 }),
  provinceName: varchar('province_name', { length: 100 }),
  cityId: varchar('city_id', { length: 20 }),
  cityName: varchar('city_name', { length: 100 }),
  subdistrictId: varchar('subdistrict_id', { length: 20 }),
  subdistrictName: varchar('subdistrict_name', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  courier: varchar('courier', { length: 50 }),
  courierService: varchar('courier_service', { length: 100 }),
  shippingCost: integer('shipping_cost').default(0),
  totalWeight: integer('total_weight').default(1000),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_orders_user_id').on(table.userId),
  index('idx_orders_status').on(table.status),
  index('idx_orders_code').on(table.orderCode)
]);

export const orderItems = pgTable('order_items', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  orderId: bigint('order_id', { mode: 'number' }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: bigint('product_id', { mode: 'number' }).notNull().references(() => products.id, { onDelete: 'restrict' }),
  qty: integer('qty').notNull(),
  price: integer('price').notNull()
}, (table) => [
  index('idx_order_items_order_id').on(table.orderId)
]);

export const paymentMethods = pgTable('payment_methods', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  logoUrl: varchar('logo_url', { length: 255 }),
  type: varchar('type', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  adminFeeFlat: bigint('admin_fee_flat', { mode: 'number' }).default(0),
  adminFeePct: numeric('admin_fee_pct', { precision: 5, scale: 2 }).default('0.00'),
  isActive: boolean('is_active').default(true),
  isRedirect: boolean('is_redirect').default(false),
  sortOrder: integer('sort_order').default(0)
});

export const paymentInstructions = pgTable('payment_instructions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  paymentMethodId: bigint('payment_method_id', { mode: 'number' }).notNull().references(() => paymentMethods.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_payment_instructions_method_id').on(table.paymentMethodId)
]);

export const paymentLogs = pgTable('payment_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  invoiceCode: varchar('invoice_code', { length: 50 }).notNull(),
  endpoint: varchar('endpoint', { length: 255 }),
  type: varchar('type', { length: 50 }),
  requestPayload: text('request_payload'),
  responsePayload: text('response_payload'),
  httpStatus: integer('http_status'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_payment_logs_invoice').on(table.invoiceCode)
]);

export const notificationTemplates = pgTable('notification_templates', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  eventTrigger: varchar('event_trigger', { length: 50 }).unique().notNull(),
  channel: varchar('channel', { length: 20 }).notNull(),
  messageContent: text('message_content').notNull(),
  isActive: boolean('is_active').default(true)
});

export const notificationLogs = pgTable('notification_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  templateId: bigint('template_id', { mode: 'number' }).references(() => notificationTemplates.id, { onDelete: 'set null' }),
  invoiceCode: varchar('invoice_code', { length: 50 }),
  recipient: varchar('recipient', { length: 150 }).notNull(),
  channel: varchar('channel', { length: 20 }).notNull(),
  requestPayload: text('request_payload'),
  responsePayload: text('response_payload'),
  status: varchar('status', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_notification_logs_template').on(table.templateId),
  index('idx_notification_logs_invoice').on(table.invoiceCode)
]);

export const settings = pgTable('settings', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  configKey: varchar('config_key', { length: 100 }).unique().notNull(),
  configValue: text('config_value'),
  updatedAt: timestamp('updated_at').defaultNow()
});
