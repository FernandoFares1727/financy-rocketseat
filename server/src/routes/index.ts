import { Router } from 'express';
import categories from './categories';
import transactions from './transactions';

const router = Router();

router.use('/categories', categories);
router.use('/transactions', transactions);

export default router;
