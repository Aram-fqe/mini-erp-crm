import { PrismaClient, UserRole, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with realistic data...');

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

  // 2. Seed Realistic Customers
  const customerData = [
    { name: 'Rajesh Kumar', mobile: '+919876543210', email: 'rajesh@apexretail.com', businessName: 'Apex Retail Store', customerType: CustomerType.RETAIL, status: CustomerStatus.ACTIVE, address: 'Shop 12, Main Market, Connaught Place, New Delhi' },
    { name: 'Priya Sharma', mobile: '+919812345678', email: 'priya@metrodistributors.com', businessName: 'Metro Distributors Pvt Ltd', customerType: CustomerType.DISTRIBUTOR, status: CustomerStatus.ACTIVE, address: 'Plot 45, Industrial Area Phase 2, Gurgaon' },
    { name: 'Amit Patel', mobile: '+919988776655', email: 'amit@patelwholesalers.com', businessName: 'Patel Wholesalers', customerType: CustomerType.WHOLESALE, status: CustomerStatus.LEAD, address: 'Ring Road Market, Surat, Gujarat' },
    { name: 'Sneha Gupta', mobile: '+919871234560', email: 'sneha.g@techmart.in', businessName: 'TechMart Solutions', customerType: CustomerType.RETAIL, status: CustomerStatus.INACTIVE, address: 'Sector 15, Noida, UP' },
    { name: 'Vikram Singh', mobile: '+919998887776', email: 'vsingh@buildwell.com', businessName: 'Buildwell Hardware', customerType: CustomerType.WHOLESALE, status: CustomerStatus.ACTIVE, address: 'Lajpat Nagar, New Delhi' },
    { name: 'Anjali Desai', mobile: '+918887776665', email: 'anjali@desaienterprises.com', businessName: 'Desai Enterprises', customerType: CustomerType.DISTRIBUTOR, status: CustomerStatus.ACTIVE, address: 'Andheri West, Mumbai, Maharashtra' },
    { name: 'Rohan Mehta', mobile: '+917776665554', email: 'rohan.m@smartretail.com', businessName: 'Smart Retail', customerType: CustomerType.RETAIL, status: CustomerStatus.LEAD, address: 'MG Road, Bangalore, Karnataka' },
    { name: 'Kavita Reddy', mobile: '+916665554443', email: 'kavita@reddygroup.in', businessName: 'Reddy Group of Companies', customerType: CustomerType.WHOLESALE, status: CustomerStatus.ACTIVE, address: 'Banjara Hills, Hyderabad, Telangana' },
    { name: 'Manoj Tiwari', mobile: '+915554443332', email: 'manoj@tiwarisuppliers.com', businessName: 'Tiwari Suppliers', customerType: CustomerType.DISTRIBUTOR, status: CustomerStatus.INACTIVE, address: 'Civil Lines, Kanpur, UP' },
    { name: 'Pooja Joshi', mobile: '+914443332221', email: 'pooja.j@joshitraders.com', businessName: 'Joshi Traders', customerType: CustomerType.RETAIL, status: CustomerStatus.ACTIVE, address: 'Viman Nagar, Pune, Maharashtra' },
    { name: 'Sanjay Chawla', mobile: '+919988112233', email: 'sanjay@chawlagroup.com', businessName: 'Chawla Group', customerType: CustomerType.WHOLESALE, status: CustomerStatus.ACTIVE, address: 'Sector 17, Chandigarh' },
    { name: 'Neha Agarwal', mobile: '+919977334455', email: 'neha@agarwalcorp.com', businessName: 'Agarwal Corp', customerType: CustomerType.DISTRIBUTOR, status: CustomerStatus.LEAD, address: 'Salt Lake City, Kolkata, West Bengal' },
    { name: 'Arun Nair', mobile: '+919966556677', email: 'arun@nairlogistics.com', businessName: 'Nair Logistics', customerType: CustomerType.RETAIL, status: CustomerStatus.ACTIVE, address: 'Kochi, Kerala' },
    { name: 'Divya Iyer', mobile: '+919955778899', email: 'divya@iyerindustries.com', businessName: 'Iyer Industries', customerType: CustomerType.WHOLESALE, status: CustomerStatus.INACTIVE, address: 'T Nagar, Chennai, Tamil Nadu' },
    { name: 'Kunal Kapoor', mobile: '+919944889900', email: 'kunal@kapoorfittings.com', businessName: 'Kapoor Fittings', customerType: CustomerType.DISTRIBUTOR, status: CustomerStatus.ACTIVE, address: 'Ludhiana, Punjab' }
  ];

  const customers = [];
  for (const data of customerData) {
    const cust = await prisma.customer.create({
      data: {
        ...data,
        gstNumber: `27ABCD${Math.floor(1000 + Math.random() * 9000)}B2Z3`,
        createdById: sales.id,
      }
    });
    customers.push(cust);
  }

  console.log('✅ Realistic Customers seeded');

  // 3. Seed Realistic Products
  const productData = [
    { name: 'Industrial Safety Helmet - Yellow', sku: 'SKU-HELMET-YEL', category: 'Safety Equipment', unitPrice: 450.00, warehouseLocation: 'Rack A-12' },
    { name: 'Heavy Duty Work Gloves (Pair)', sku: 'SKU-GLOVES-HD', category: 'Safety Equipment', unitPrice: 180.50, warehouseLocation: 'Rack A-15' },
    { name: 'Digital Multimeter Pro X1', sku: 'SKU-METER-X1', category: 'Electronics & Tools', unitPrice: 1250.00, warehouseLocation: 'Shelf B-04' },
    { name: 'LED High Bay Light 100W', sku: 'SKU-LIGHT-100W', category: 'Lighting', unitPrice: 2800.00, warehouseLocation: 'Bay C-02' },
    { name: 'Safety Goggles - Anti Fog', sku: 'SKU-GOGGLES-AF', category: 'Safety Equipment', unitPrice: 250.00, warehouseLocation: 'Rack A-13' },
    { name: 'Reflective Safety Vest - Orange', sku: 'SKU-VEST-ORG', category: 'Safety Equipment', unitPrice: 300.00, warehouseLocation: 'Rack A-14' },
    { name: 'Professional Cordless Drill 18V', sku: 'SKU-DRILL-18V', category: 'Electronics & Tools', unitPrice: 4500.00, warehouseLocation: 'Shelf B-05' },
    { name: 'Angle Grinder 800W', sku: 'SKU-GRINDER-800', category: 'Electronics & Tools', unitPrice: 3200.00, warehouseLocation: 'Shelf B-06' },
    { name: 'Laser Distance Meter 50m', sku: 'SKU-LASER-50M', category: 'Electronics & Tools', unitPrice: 2100.00, warehouseLocation: 'Shelf B-07' },
    { name: 'LED Panel Light 36W (2x2)', sku: 'SKU-PANEL-36W', category: 'Lighting', unitPrice: 1500.00, warehouseLocation: 'Bay C-03' },
    { name: 'Industrial Flood Light 200W', sku: 'SKU-FLOOD-200W', category: 'Lighting', unitPrice: 4800.00, warehouseLocation: 'Bay C-04' },
    { name: 'Cat6 Ethernet Cable - 305m Box', sku: 'SKU-CAT6-305M', category: 'Networking', unitPrice: 5500.00, warehouseLocation: 'Pallet D-01' },
    { name: '24-Port Gigabit Switch', sku: 'SKU-SWITCH-24P', category: 'Networking', unitPrice: 6200.00, warehouseLocation: 'Shelf B-08' },
    { name: 'Steel Toe Safety Shoes (Size 9)', sku: 'SKU-SHOES-S9', category: 'Safety Equipment', unitPrice: 1800.00, warehouseLocation: 'Rack A-16' },
    { name: 'Dust Mask N95 (Pack of 20)', sku: 'SKU-MASK-N95', category: 'Safety Equipment', unitPrice: 600.00, warehouseLocation: 'Rack A-17' }
  ];

  const products = [];
  for (const data of productData) {
    const minStock = Math.floor(10 + Math.random() * 40); // 10 to 50
    // Make a couple of items below min stock for testing alerts
    const currentStock = (data.name.includes('Multimeter') || data.name.includes('Vest')) ? minStock - 5 : minStock + Math.floor(Math.random() * 100);
    
    const prod = await prisma.product.create({
      data: {
        ...data,
        currentStock,
        minStockQuantity: minStock,
      }
    });
    products.push(prod);

    // Initial stock movement for each product
    await prisma.stockMovement.create({
      data: {
        productId: prod.id,
        quantity: currentStock,
        movementType: MovementType.IN,
        reason: 'Initial Inventory Setup',
        createdById: warehouse.id,
      },
    });
  }

  console.log('✅ Realistic Products and initial stock movements seeded');

  // 4. Seed Random FollowUps
  const followUpNotes = [
    'Called to discuss bulk pricing. Needs quotation by Friday.',
    'Follow up on sample delivery.',
    'Customer requested revised catalog.',
    'Check if they need restocking of safety equipment.',
    'Met at trade show, promising lead for next quarter.',
    'Sent invoice, waiting for payment confirmation.',
    'Follow up on warranty claim for defective items.',
    'Introductory call, sent company profile.',
    'Scheduled meeting for next Tuesday at their office.',
    'Customer is comparing our prices with competitor, will decide next week.'
  ];

  for (let i = 0; i < 20; i++) {
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    const daysOffset = Math.floor(Math.random() * 14) - 7; // -7 to +7 days
    
    await prisma.followUp.create({
      data: {
        customerId: randomCustomer.id,
        notes: followUpNotes[Math.floor(Math.random() * followUpNotes.length)],
        followUpDate: new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000),
        completed: daysOffset < 0 ? true : false,
        createdById: sales.id,
      },
    });
  }

  console.log('✅ Follow-ups seeded');

  // 5. Seed Realistic Challans
  for (let i = 1; i <= 15; i++) {
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    const numItems = Math.floor(1 + Math.random() * 4); // 1 to 4 items
    const challanItems = [];
    let totalQuantity = 0;

    for (let j = 0; j < numItems; j++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(1 + Math.random() * 20); // 1 to 20 qty
      totalQuantity += qty;
      
      challanItems.push({
        productId: randomProduct.id,
        productName: randomProduct.name,
        productSku: randomProduct.sku,
        unitPrice: randomProduct.unitPrice,
        quantity: qty,
      });

      // Also create an OUT movement for this challan to make stock accurate
      await prisma.stockMovement.create({
        data: {
          productId: randomProduct.id,
          quantity: qty,
          movementType: MovementType.OUT,
          reason: `Dispatch for Challan CH-2026-${i.toString().padStart(4, '0')}`,
          createdById: warehouse.id,
        },
      });
    }

    const statuses = [ChallanStatus.DRAFT, ChallanStatus.CONFIRMED, ChallanStatus.CANCELLED];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    await prisma.challan.create({
      data: {
        challanNumber: `CH-2026-${i.toString().padStart(4, '0')}`,
        customerId: randomCustomer.id,
        totalQuantity,
        status,
        createdById: sales.id,
        items: {
          create: challanItems,
        },
      },
    });
  }

  console.log(`✅ 15 Delivery Challans created with stock movements.`);
  console.log('🎉 Realistic Seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
