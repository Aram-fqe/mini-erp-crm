import { PrismaClient, UserRole, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data in reverse relation order
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users (Admin, Sales, Warehouse, Accounts)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@minierp.com',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const sales = await prisma.user.create({
    data: {
      name: 'Sales Executive',
      email: 'sales@minierp.com',
      passwordHash,
      role: UserRole.SALES,
    },
  });

  const warehouse = await prisma.user.create({
    data: {
      name: 'Warehouse Manager',
      email: 'warehouse@minierp.com',
      passwordHash,
      role: UserRole.WAREHOUSE,
    },
  });

  const accounts = await prisma.user.create({
    data: {
      name: 'Accounts Specialist',
      email: 'accounts@minierp.com',
      passwordHash,
      role: UserRole.ACCOUNTS,
    },
  });

  console.log('✅ Users seeded (Admin, Sales, Warehouse, Accounts)');

  // 2. Seed Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rajesh Kumar',
      mobile: '+919876543210',
      email: 'rajesh@apexretail.com',
      businessName: 'Apex Retail Store',
      gstNumber: '07AAAAA0000A1Z5',
      customerType: CustomerType.RETAIL,
      address: 'Shop 12, Main Market, Connaught Place, New Delhi',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Key retail customer looking for bulk discounts on next order.',
      createdById: sales.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Priya Sharma',
      mobile: '+919812345678',
      email: 'priya@metrodistributors.com',
      businessName: 'Metro Distributors Pvt Ltd',
      gstNumber: '27BBBCA1111B2Z3',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Plot 45, Industrial Area Phase 2, Gurgaon',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'North region master distributor. High volume orders.',
      createdById: admin.id,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Amit Patel',
      mobile: '+919988776655',
      email: 'amit@patelwholesalers.com',
      businessName: 'Patel Wholesalers',
      gstNumber: '24CCCCA2222C3Z1',
      customerType: CustomerType.WHOLESALE,
      address: 'Ring Road Market, Surat, Gujarat',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      notes: 'Initial inquiry received regarding electronics catalog.',
      createdById: sales.id,
    },
  });

  console.log('✅ Customers seeded');

  // 3. Seed Products
  const product1 = await prisma.product.create({
    data: {
      name: 'Industrial Safety Helmet - Yellow',
      sku: 'SKU-HELMET-YEL',
      category: 'Safety Equipment',
      unitPrice: 450.00,
      currentStock: 150,
      minStockQuantity: 30,
      warehouseLocation: 'Rack A-12',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Heavy Duty Work Gloves (Pair)',
      sku: 'SKU-GLOVES-HD',
      category: 'Safety Equipment',
      unitPrice: 180.50,
      currentStock: 300,
      minStockQuantity: 50,
      warehouseLocation: 'Rack A-15',
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Digital Multimeter Pro X1',
      sku: 'SKU-METER-X1',
      category: 'Electronics & Tools',
      unitPrice: 1250.00,
      currentStock: 15,
      minStockQuantity: 20, // Currently below min stock alert!
      warehouseLocation: 'Shelf B-04',
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: 'LED High Bay Light 100W',
      sku: 'SKU-LIGHT-100W',
      category: 'Lighting',
      unitPrice: 2800.00,
      currentStock: 45,
      minStockQuantity: 10,
      warehouseLocation: 'Bay C-02',
    },
  });

  console.log('✅ Products seeded');

  // 4. Seed Stock Movements
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: product1.id,
        quantity: 150,
        movementType: MovementType.IN,
        reason: 'Initial Inventory Inward',
        createdById: warehouse.id,
      },
      {
        productId: product2.id,
        quantity: 300,
        movementType: MovementType.IN,
        reason: 'Initial Inventory Inward',
        createdById: warehouse.id,
      },
      {
        productId: product3.id,
        quantity: 20,
        movementType: MovementType.IN,
        reason: 'Initial Inventory Inward',
        createdById: warehouse.id,
      },
      {
        productId: product3.id,
        quantity: 5,
        movementType: MovementType.OUT,
        reason: 'Sample dispatched to customer',
        createdById: warehouse.id,
      },
      {
        productId: product4.id,
        quantity: 45,
        movementType: MovementType.IN,
        reason: 'Initial Inventory Inward',
        createdById: warehouse.id,
      },
    ],
  });

  console.log('✅ Stock movements seeded');

  // 5. Seed FollowUps
  await prisma.followUp.create({
    data: {
      customerId: customer3.id,
      notes: 'Call Amit to discuss bulk pricing for wholesale order.',
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdById: sales.id,
    },
  });

  console.log('✅ Follow-ups seeded');

  // 6. Seed Sample Delivery Challan with Product Snapshot Items
  const challan = await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-0001',
      customerId: customer1.id,
      totalQuantity: 20,
      status: ChallanStatus.CONFIRMED,
      createdById: sales.id,
      items: {
        create: [
          {
            productId: product1.id,
            productName: product1.name,
            productSku: product1.sku,
            unitPrice: product1.unitPrice,
            quantity: 10,
          },
          {
            productId: product2.id,
            productName: product2.name,
            productSku: product2.sku,
            unitPrice: product2.unitPrice,
            quantity: 10,
          },
        ],
      },
    },
  });

  console.log(`✅ Sample Delivery Challan created: ${challan.challanNumber}`);
  console.log('🎉 Seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
