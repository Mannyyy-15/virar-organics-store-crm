require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

function seed() {
  const existingUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (existingUsers > 0) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const insertAll = db.transaction(() => {
    const userStmt = db.prepare(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)'
    );

    const adminId = userStmt.run(
      'Manthan Admin',
      'admin@virarorganics.in',
      bcrypt.hashSync('Admin@123', 10),
      'ADMIN',
      '+91 98200 11111'
    ).lastInsertRowid;

    const salesId = userStmt.run(
      'Priya Sales',
      'sales@virarorganics.in',
      bcrypt.hashSync('Sales@123', 10),
      'SALES_EXECUTIVE',
      '+91 98200 22222'
    ).lastInsertRowid;

    const customerId = userStmt.run(
      'Aarav Mehta',
      'customer@virarorganics.in',
      bcrypt.hashSync('Customer@123', 10),
      'CUSTOMER',
      '+91 98200 33333'
    ).lastInsertRowid;

    const products = [
      {
        name: 'Wild Forest Raw Honey',
        slug: 'wild-forest-raw-honey',
        category: 'Honey & Sweeteners',
        description: 'Unprocessed, raw multifloral honey harvested ethically from the Sahyadri hills. Rich in natural enzymes and antioxidants.',
        price: 499,
        unit: '500g Jar',
        stock: 25,
        image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'A2 Gir Cow Bilona Ghee',
        slug: 'a2-gir-cow-bilona-ghee',
        category: 'Ghee & Dairy',
        description: 'Traditional hand-churned A2 Bilona ghee made from curd of free-grazing Gir cows. Aromatic and golden.',
        price: 1299,
        unit: '500ml Jar',
        stock: 1, // Deliberately 1 for testing Problem 1 (Last Item in Stock)
        image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Cold-Pressed Groundnut Oil',
        slug: 'cold-pressed-groundnut-oil',
        category: 'Cold-Pressed Oils',
        description: 'Wood-pressed (Lakdi Ghani) unrefined groundnut oil retaining natural aroma and heart-healthy nutrients.',
        price: 380,
        unit: '1 Litre',
        stock: 30,
        image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Cold-Pressed Virgin Coconut Oil',
        slug: 'cold-pressed-virgin-coconut-oil',
        category: 'Cold-Pressed Oils',
        description: 'Extracted from fresh organic coconut milk without heat. Ideal for cooking, baby care, and hair nourishment.',
        price: 450,
        unit: '500ml',
        stock: 18,
        image_url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Organic Indrayani Brown Rice',
        slug: 'organic-indrayani-brown-rice',
        category: 'Grains & Flours',
        description: 'Fragrant, unpolished Indrayani rice grown without synthetic pesticides in Maharashtra.',
        price: 220,
        unit: '1 kg',
        stock: 40,
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Stone-Ground Khapli Wheat Flour',
        slug: 'stone-ground-khapli-wheat-flour',
        category: 'Grains & Flours',
        description: 'Ancient Emmer (Khapli) wheat stone-milled in small batches. Low glycemic index and easy to digest.',
        price: 195,
        unit: '1 kg',
        stock: 35,
        image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Lakadong High-Curcumin Turmeric',
        slug: 'lakadong-high-curcumin-turmeric',
        category: 'Spices & Herbs',
        description: 'Single-origin Meghalaya Lakadong turmeric powder with >7% curcumin content. Vibrant color and earthy aroma.',
        price: 260,
        unit: '250g',
        stock: 22,
        image_url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Organic Kolhapur Jaggery Powder',
        slug: 'organic-kolhapur-jaggery-powder',
        category: 'Honey & Sweeteners',
        description: 'Chemical-free, sulphur-free sugarcane jaggery powder. A wholesome everyday substitute for refined sugar.',
        price: 150,
        unit: '500g',
        stock: 50,
        image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Kashmiri Mongra Saffron',
        slug: 'kashmiri-mongra-saffron',
        category: 'Spices & Herbs',
        description: 'Grade A1 hand-picked Pampore saffron strands. Pure, potent, and lab-tested for zero adulteration.',
        price: 650,
        unit: '2g Box',
        stock: 12,
        image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Organic Sprouted Ragi Malt',
        slug: 'organic-sprouted-ragi-malt',
        category: 'Grains & Flours',
        description: 'Nutrient-dense sprouted finger millet flour, naturally dried and stone-ground for porridges and rotis.',
        price: 180,
        unit: '500g',
        stock: 28,
        image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Himalayan Pink Rock Salt',
        slug: 'himalayan-pink-rock-salt',
        category: 'Spices & Herbs',
        description: 'Unrefined Sendha Namak rich in trace minerals. Finely ground for daily cooking and fasting.',
        price: 95,
        unit: '1 kg',
        stock: 60,
        image_url: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Organic Tulsi & Moringa Green Tea',
        slug: 'organic-tulsi-moringa-green-tea',
        category: 'Spices & Herbs',
        description: 'Caffeine-light herbal blend of shade-dried Rama Tulsi, Krishna Tulsi, and Moringa leaves.',
        price: 240,
        unit: '100g Tin',
        stock: 0, // Out of stock example
        image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=600&q=80',
      },
    ];

    const prodStmt = db.prepare(
      `INSERT INTO products (name, slug, category, description, price, unit, stock, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const productIds = products.map((p) =>
      prodStmt.run(p.name, p.slug, p.category, p.description, p.price, p.unit, p.stock, p.image_url).lastInsertRowid
    );

    // 5 Sample Leads (Bulk Order Enquiries)
    const leadStmt = db.prepare(
      `INSERT INTO leads (name, phone, email, product_id, product_name, quantity, message, status, notes, follow_up_date, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    leadStmt.run(
      'Rohan Deshmukh (Hotel GreenLeaf)',
      '+91 98211 44556',
      'procurement@greenleafvirar.in',
      productIds[2],
      'Cold-Pressed Groundnut Oil',
      50,
      'Need 50 litres monthly for our restaurant kitchen. Please share wholesale rate.',
      'New',
      'Received via website bulk enquiry form.',
      today,
      salesId
    );
    leadStmt.run(
      'Sneha Kulkarni (Vedic Wellness)',
      '+91 97654 33221',
      'sneha@vedicwellness.co.in',
      productIds[1],
      'A2 Gir Cow Bilona Ghee',
      30,
      'Looking for corporate Diwali gifting hampers with 500ml A2 ghee jars.',
      'Contacted',
      'Shared price sheet on WhatsApp. Waiting for final count.',
      today,
      salesId
    );
    leadStmt.run(
      'Vikram Shah (FreshMart Vasai)',
      '+91 99201 77889',
      'vikram@freshmartvasai.com',
      productIds[0],
      'Wild Forest Raw Honey',
      100,
      'Retail shelf stock enquiry for 3 stores in Vasai-Virar.',
      'New',
      '',
      tomorrow,
      null
    );
    leadStmt.run(
      'Meera Nair',
      '+91 98199 66554',
      'meera.nair@gmail.com',
      productIds[5],
      'Stone-Ground Khapli Wheat Flour',
      25,
      'Apartment group buy for 25 families in Virar West.',
      'Converted',
      'Converted to direct bulk invoice #VO-BULK-104.',
      null,
      salesId
    );
    leadStmt.run(
      'Karan Malhotra',
      '+91 98330 11223',
      'karan.m@foodcraft.in',
      productIds[6],
      'Lakadong High-Curcumin Turmeric',
      40,
      'Need sample batch before committing to 40kg.',
      'Lost',
      'Client opted for local uncertified supplier due to budget.',
      null,
      salesId
    );

    // 3 Sample Orders
    const orderStmt = db.prepare(
      `INSERT INTO orders (
        order_number, user_id, customer_name, customer_phone,
        shipping_address, city, pincode, payment_method,
        payment_status, status, total_amount, paid_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const itemStmt = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const o1 = orderStmt.run(
      'VO-20261127-1001',
      customerId,
      'Aarav Mehta',
      '+91 98200 33333',
      'B-402, Evershine City, Global City',
      'Virar West',
      '401303',
      'ONLINE',
      'PAID',
      'Delivered',
      998,
      new Date().toISOString()
    ).lastInsertRowid;
    itemStmt.run(o1, productIds[0], 'Wild Forest Raw Honey', 499, 2, 998);

    const o2 = orderStmt.run(
      'VO-20261127-1002',
      customerId,
      'Aarav Mehta',
      '+91 98200 33333',
      'B-402, Evershine City, Global City',
      'Virar West',
      '401303',
      'ONLINE',
      'PAID',
      'Paid',
      600,
      new Date().toISOString()
    ).lastInsertRowid;
    itemStmt.run(o2, productIds[2], 'Cold-Pressed Groundnut Oil', 380, 1, 380);
    itemStmt.run(o2, productIds[4], 'Organic Indrayani Brown Rice', 220, 1, 220);

    const o3 = orderStmt.run(
      'VO-20261127-1003',
      customerId,
      'Aarav Mehta',
      '+91 98200 33333',
      'Shop 12, Viva Arcade, Station Road',
      'Virar East',
      '401305',
      'COD',
      'UNPAID',
      'Pending',
      455,
      null
    ).lastInsertRowid;
    itemStmt.run(o3, productIds[6], 'Lakadong High-Curcumin Turmeric', 260, 1, 260);
    itemStmt.run(o3, productIds[5], 'Stone-Ground Khapli Wheat Flour', 195, 1, 195);

    // Keep adminId referenced cleanly
    void adminId;
  });

  insertAll();
  console.log('Seeded Virar Organics database with 3 users, 12 products, 5 leads, and 3 orders.');
}

if (require.main === module) {
  seed();
}

module.exports = seed;
