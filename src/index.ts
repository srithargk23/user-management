import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db';
import { PORT, CORS_ORIGIN } from './config/env';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import productsRoutes from './routes/products.routes';
import categoriesRoutes from './routes/categories.routes';
import { errorHandler } from './middleware/errorHandler';
import productRoutes from "./routes/products.routes";
import categoryRoutes from "./routes/categories.routes";

async function main() {
  await connectDB();

  const app = express();

  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

  const authLimiter = rateLimit({ windowMs: 60_000, max: 10 });
 app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);

  app.use(errorHandler);  

  app.get("/", (req, res) => {
  res.send("✅ API is running");
});


app.use("/api/products", productRoutes);

app.use("/api/categories", categoryRoutes);

  app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
