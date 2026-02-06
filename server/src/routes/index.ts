import { Router } from 'express';
import categories from './categories';
import transactions from './transactions';
import goals from './goals';

const router = Router();

router.use('/categories', categories);
router.use('/transactions', transactions);
router.use('/goals', goals);

export default router;
