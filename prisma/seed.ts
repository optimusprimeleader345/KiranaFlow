import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const dbPath = dbUrl.replace(/^file:/, "");
const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.join(process.cwd(), dbPath);

const sqlite = new Database(resolvedPath);
sqlite.pragma("journal_mode = WAL");
const adapter = new PrismaBetterSqlite3({ url: resolvedPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.orderLine.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash("admin123", 12);
  const retailerHash = await bcrypt.hash("retailer123", 12);

  const admin = await prisma.user.create({
    data: { email: "admin@fmcg.com", passwordHash: adminHash, name: "Distributor Admin", role: "ADMIN" },
  });
  void admin;

  const retailers = await Promise.all([
    prisma.user.create({ data: { email: "rahul@kirana.com", passwordHash: retailerHash, name: "Rahul Sharma", role: "RETAILER" } }),
    prisma.user.create({ data: { email: "priya@store.com", passwordHash: retailerHash, name: "Priya Patel", role: "RETAILER" } }),
    prisma.user.create({ data: { email: "suresh@mart.com", passwordHash: retailerHash, name: "Suresh Kumar", role: "RETAILER" } }),
    prisma.user.create({ data: { email: "meena@shop.com", passwordHash: retailerHash, name: "Meena Devi", role: "RETAILER" } }),
    prisma.user.create({ data: { email: "arjun@general.com", passwordHash: retailerHash, name: "Arjun Singh", role: "RETAILER" } }),
    prisma.user.create({ data: { email: "kavita@provision.com", passwordHash: retailerHash, name: "Kavita Reddy", role: "RETAILER" } }),
    prisma.user.create({ data: { email: "manoj@wholesale.com", passwordHash: retailerHash, name: "Manoj Gupta", role: "RETAILER" } }),
    prisma.user.create({ data: { email: "demo@retailer.com", passwordHash: retailerHash, name: "Demo Retailer", role: "RETAILER" } }),
  ]);

  const products = await Promise.all([
    prisma.product.create({ data: { sku: "PARLEG-CTN", name: "Parle-G Biscuits", aliases: JSON.stringify(["parle g","parleg","parle biscuit","parle-g biscuit","glucose biscuit"]), unit: "carton", pricePerUnit: 480, category: "Biscuits" } }),
    prisma.product.create({ data: { sku: "BRIT-CTN", name: "Britannia Good Day", aliases: JSON.stringify(["britannia goodday","good day biscuit","britannia cookie","goodday"]), unit: "carton", pricePerUnit: 520, category: "Biscuits" } }),
    prisma.product.create({ data: { sku: "OREO-CTN", name: "Oreo Chocolate Biscuits", aliases: JSON.stringify(["oreo","oreo biscuit","cadbury oreo"]), unit: "carton", pricePerUnit: 600, category: "Biscuits" } }),
    prisma.product.create({ data: { sku: "MARIE-CTN", name: "Britannia Marie Gold", aliases: JSON.stringify(["marie gold","marie biscuit","britannia marie"]), unit: "carton", pricePerUnit: 390, category: "Biscuits" } }),
    prisma.product.create({ data: { sku: "MAGGI-CTN", name: "Maggi Noodles 70g", aliases: JSON.stringify(["maggi","maggie","maggi noodles","maggi masala","2 min noodles","noodles maggi"]), unit: "carton", pricePerUnit: 840, category: "Noodles" } }),
    prisma.product.create({ data: { sku: "YIPPEE-CTN", name: "Sunfeast Yippee Noodles", aliases: JSON.stringify(["yippee","sunfeast yippee","yipee noodles","yippi"]), unit: "carton", pricePerUnit: 780, category: "Noodles" } }),
    prisma.product.create({ data: { sku: "SURF-1KG", name: "Surf Excel 1kg", aliases: JSON.stringify(["surf excel","surf 1kg","surf excell","surf xl","surf excel 1 kg"]), unit: "kg", pricePerUnit: 220, category: "Detergent" } }),
    prisma.product.create({ data: { sku: "ARIEL-1KG", name: "Ariel Detergent 1kg", aliases: JSON.stringify(["ariel","ariel 1kg","ariel powder","arial"]), unit: "kg", pricePerUnit: 240, category: "Detergent" } }),
    prisma.product.create({ data: { sku: "WHEEL-1KG", name: "Wheel Detergent 1kg", aliases: JSON.stringify(["wheel","wheel detergent","wheel powder","weel"]), unit: "kg", pricePerUnit: 85, category: "Detergent" } }),
    prisma.product.create({ data: { sku: "TIDE-1KG", name: "Tide Detergent 1kg", aliases: JSON.stringify(["tide","tide detergent","tide powder","tide 1kg"]), unit: "kg", pricePerUnit: 160, category: "Detergent" } }),
    prisma.product.create({ data: { sku: "FORTUNE-5L", name: "Fortune Refined Oil 5L", aliases: JSON.stringify(["fortune oil","fortune sunflower","fortune 5l","fortune 5 litre"]), unit: "pcs", pricePerUnit: 750, category: "Oil" } }),
    prisma.product.create({ data: { sku: "DHARA-5L", name: "Dhara Mustard Oil 5L", aliases: JSON.stringify(["dhara","dhara oil","dhara mustard","dhara sarson"]), unit: "pcs", pricePerUnit: 820, category: "Oil" } }),
    prisma.product.create({ data: { sku: "TAJMAHAL-500G", name: "Taj Mahal Tea 500g", aliases: JSON.stringify(["taj mahal tea","taj mahal","tajmahal","taj tea"]), unit: "pcs", pricePerUnit: 320, category: "Tea" } }),
    prisma.product.create({ data: { sku: "TATACHA-500G", name: "Tata Chai 500g", aliases: JSON.stringify(["tata tea","tata chai","tata premium tea","tata 500g"]), unit: "pcs", pricePerUnit: 290, category: "Tea" } }),
    prisma.product.create({ data: { sku: "LUX-100G", name: "Lux Soap 100g", aliases: JSON.stringify(["lux","lux soap","lux bathing bar","lux beauty soap"]), unit: "pcs", pricePerUnit: 48, category: "Soap" } }),
    prisma.product.create({ data: { sku: "LIFEBUOY-100G", name: "Lifebuoy Soap 100g", aliases: JSON.stringify(["lifebuoy","lifebouy","life buoy","lifeboy soap"]), unit: "pcs", pricePerUnit: 42, category: "Soap" } }),
    prisma.product.create({ data: { sku: "DETTOL-SOAP", name: "Dettol Soap 75g", aliases: JSON.stringify(["dettol soap","dettol","dettol bathing bar"]), unit: "pcs", pricePerUnit: 55, category: "Soap" } }),
    prisma.product.create({ data: { sku: "H&S-180ML", name: "Head & Shoulders Shampoo 180ml", aliases: JSON.stringify(["head and shoulders","head shoulder","h&s shampoo","head shoulders"]), unit: "pcs", pricePerUnit: 220, category: "Shampoo" } }),
    prisma.product.create({ data: { sku: "SUNSILK-180ML", name: "Sunsilk Shampoo 180ml", aliases: JSON.stringify(["sunsilk","sunsilk shampoo","sun silk"]), unit: "pcs", pricePerUnit: 160, category: "Shampoo" } }),
    prisma.product.create({ data: { sku: "INDIAGATE-5KG", name: "India Gate Basmati Rice 5kg", aliases: JSON.stringify(["india gate","india gate rice","india gate basmati","basmati rice"]), unit: "kg", pricePerUnit: 320, category: "Rice" } }),
    prisma.product.create({ data: { sku: "SUGAR-1KG", name: "Sugar 1kg", aliases: JSON.stringify(["sugar","cheeni","chini","shakkar","sugar 1 kg"]), unit: "kg", pricePerUnit: 44, category: "Sugar" } }),
    prisma.product.create({ data: { sku: "TATA-SALT-1KG", name: "Tata Salt 1kg", aliases: JSON.stringify(["tata salt","salt","namak","tata namak","iodised salt"]), unit: "kg", pricePerUnit: 22, category: "Salt" } }),
    prisma.product.create({ data: { sku: "COLGATE-100G", name: "Colgate MaxFresh 100g", aliases: JSON.stringify(["colgate","colgate maxfresh","colgate toothpaste","toothpaste"]), unit: "pcs", pricePerUnit: 65, category: "Toothpaste" } }),
    prisma.product.create({ data: { sku: "CLOSEUP-100G", name: "Close Up Toothpaste 100g", aliases: JSON.stringify(["close up","closeup","closeup toothpaste"]), unit: "pcs", pricePerUnit: 58, category: "Toothpaste" } }),
    prisma.product.create({ data: { sku: "LAYS-CTN", name: "Lays Classic Chips", aliases: JSON.stringify(["lays","lay's","lays chips","potato chips lays"]), unit: "carton", pricePerUnit: 480, category: "Snacks" } }),
    prisma.product.create({ data: { sku: "KURKURE-CTN", name: "Kurkure Masala Munch", aliases: JSON.stringify(["kurkure","kurkure masala","kukure","kurkure snack"]), unit: "carton", pricePerUnit: 420, category: "Snacks" } }),
    prisma.product.create({ data: { sku: "THUMSUP-2L", name: "Thums Up 2L", aliases: JSON.stringify(["thums up","thumsup","thumb up","thumps up cola"]), unit: "pcs", pricePerUnit: 65, category: "Beverages" } }),
    prisma.product.create({ data: { sku: "LIMCA-2L", name: "Limca 2L", aliases: JSON.stringify(["limca","limka","limca lemon","limca soda"]), unit: "pcs", pricePerUnit: 65, category: "Beverages" } }),
    prisma.product.create({ data: { sku: "MAAZA-1L", name: "Maaza Mango Drink 1L", aliases: JSON.stringify(["maaza","mazza","maaza mango","mango drink maaza"]), unit: "pcs", pricePerUnit: 50, category: "Beverages" } }),
    prisma.product.create({ data: { sku: "AMUL-GHEE-1L", name: "Amul Pure Ghee 1L", aliases: JSON.stringify(["amul ghee","amul","ghee","pure ghee amul","desi ghee"]), unit: "pcs", pricePerUnit: 580, category: "Ghee" } }),
    prisma.product.create({ data: { sku: "AMUL-BUTTER-500G", name: "Amul Butter 500g", aliases: JSON.stringify(["amul butter","butter amul","white butter","amul makhan"]), unit: "pcs", pricePerUnit: 230, category: "Dairy" } }),
    prisma.product.create({ data: { sku: "AMUL-CHEESE-200G", name: "Amul Cheese Slices 200g", aliases: JSON.stringify(["amul cheese","cheese slices","processed cheese amul"]), unit: "pcs", pricePerUnit: 150, category: "Dairy" } }),
    prisma.product.create({ data: { sku: "NESCAFE-100G", name: "Nescafe Classic Coffee 100g", aliases: JSON.stringify(["nescafe","nescafé","nescafe classic","instant coffee nescafe"]), unit: "pcs", pricePerUnit: 320, category: "Coffee" } }),
    prisma.product.create({ data: { sku: "KISSAN-500G", name: "Kissan Mixed Fruit Jam 500g", aliases: JSON.stringify(["kissan jam","kissan","mixed fruit jam","fruit jam kissan"]), unit: "pcs", pricePerUnit: 150, category: "Jam" } }),
    prisma.product.create({ data: { sku: "MAGGI-KTH-1KG", name: "Maggi Tomato Ketchup 1kg", aliases: JSON.stringify(["maggi ketchup","tomato ketchup","maggi sauce","ketchup maggi"]), unit: "pcs", pricePerUnit: 125, category: "Sauces" } }),
    prisma.product.create({ data: { sku: "AASHIR-5KG", name: "Aashirvaad Atta 5kg", aliases: JSON.stringify(["aashirvaad","aashirvaad atta","ashirwad flour","wheat flour aashirvaad"]), unit: "kg", pricePerUnit: 220, category: "Flour" } }),
    prisma.product.create({ data: { sku: "TOOR-DAL-1KG", name: "Toor Dal 1kg", aliases: JSON.stringify(["toor dal","arhar dal","tuvar dal","toor daal","dal"]), unit: "kg", pricePerUnit: 140, category: "Pulses" } }),
    prisma.product.create({ data: { sku: "AMUL-MILK-500G", name: "Amul Full Cream Milk Powder 500g", aliases: JSON.stringify(["amul milk powder","milk powder","amul doodh powder","full cream milk powder"]), unit: "pcs", pricePerUnit: 260, category: "Dairy" } }),
    prisma.product.create({ data: { sku: "PARACHUTE-500ML", name: "Parachute Coconut Oil 500ml", aliases: JSON.stringify(["parachute","coconut oil","parachute coconut","nariyal tel"]), unit: "pcs", pricePerUnit: 240, category: "Oil" } }),
    prisma.product.create({ data: { sku: "REDBULL-250ML", name: "Red Bull Energy Drink 250ml", aliases: JSON.stringify(["red bull","redbull","energy drink red bull"]), unit: "pcs", pricePerUnit: 125, category: "Beverages" } }),
  ]);

  const [rahul, priya, suresh, meena, arjun, kavita, manoj, demo] = retailers;
  const [parleg, britannia, oreo, marie, maggi, yippee, surf, ariel, wheel, tide,
    fortune, dhara, tajmahal, tatacha, lux, lifebuoy, dettol,
    headshould, sunsilk, indiagate, sugar, salt, colgate, closeup,
    lays, kurkure, thumsup, limca, maaza, amulghee, amulbutter, amulcheese,
    nescafe, kissan, maggiketchup, aashirvaad, toorDal, amulmilk, parachute, redbull] = products;

  void [oreo, marie, yippee, ariel, wheel, tide, dhara, tatacha, dettol, headshould, sunsilk, closeup, thumsup, limca, maaza, amulcheese, kissan, maggiketchup, amulmilk, redbull];

  type Prod = typeof parleg;
  async function createOrder(
    retailer: typeof rahul,
    lines: Array<{ product: Prod; qty: number }>,
    status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED",
    daysAgo: number
  ) {
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const totalAmount = lines.reduce((s, l) => s + l.qty * l.product.pricePerUnit, 0);
    return prisma.order.create({
      data: {
        retailerId: retailer.id, status, totalAmount, createdAt, updatedAt: createdAt,
        lines: {
          create: lines.map((l) => ({
            rawText: l.product.name, productId: l.product.id,
            quantity: l.qty, unit: l.product.unit,
            matchStatus: "MATCHED", matchScore: 0.95,
            unitPrice: l.product.pricePerUnit, totalPrice: l.qty * l.product.pricePerUnit,
          })),
        },
      },
    });
  }

  await createOrder(rahul, [{ product: parleg, qty: 10 }, { product: maggi, qty: 5 }], "DELIVERED", 30);
  await createOrder(priya, [{ product: surf, qty: 5 }, { product: lux, qty: 12 }], "SHIPPED", 20);
  await createOrder(suresh, [{ product: indiagate, qty: 3 }, { product: toorDal, qty: 5 }, { product: sugar, qty: 10 }], "DELIVERED", 15);
  await createOrder(meena, [{ product: colgate, qty: 24 }, { product: lifebuoy, qty: 24 }], "PROCESSING", 10);
  await createOrder(arjun, [{ product: maggi, qty: 20 }, { product: britannia, qty: 10 }], "CONFIRMED", 7);
  await createOrder(kavita, [{ product: amulghee, qty: 6 }, { product: amulbutter, qty: 12 }], "PENDING", 5);
  await createOrder(manoj, [{ product: fortune, qty: 10 }, { product: parachute, qty: 20 }], "CONFIRMED", 4);
  await createOrder(demo, [{ product: parleg, qty: 15 }, { product: britannia, qty: 10 }, { product: lays, qty: 8 }], "SHIPPED", 3);
  await createOrder(rahul, [{ product: nescafe, qty: 6 }, { product: tajmahal, qty: 10 }], "PENDING", 2);
  await createOrder(priya, [{ product: aashirvaad, qty: 5 }, { product: salt, qty: 20 }, { product: sugar, qty: 10 }], "PENDING", 1);
  await createOrder(suresh, [{ product: kurkure, qty: 10 }, { product: lays, qty: 10 }, { product: oreo, qty: 5 }], "DELIVERED", 25);
  await createOrder(demo, [{ product: surf, qty: 10 }, { product: ariel, qty: 5 }], "PENDING", 0);

  console.log(`✅ Seeded:
  - ${await prisma.user.count()} users (1 admin + 8 retailers)
  - ${await prisma.product.count()} products
  - ${await prisma.order.count()} orders`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
