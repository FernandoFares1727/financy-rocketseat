import express from 'express';
import cors from 'cors';
import { Decimal } from '@prisma/client/runtime/library';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Middleware para serializar Decimals do Prisma
app.use((req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    const serialize = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      
      // Detecta Decimal corretamente
      if (obj instanceof Decimal) {
        return Number(obj);
      }
      
      if (typeof obj !== 'object') return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(serialize);
      }
      
      const serialized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        serialized[key] = serialize(value);
      }
      return serialized;
    };
    
    return originalJson.call(this, serialize(data));
  };
  
  next();
});

app.use('/api', routes);

app.use(errorHandler);

export default app;
