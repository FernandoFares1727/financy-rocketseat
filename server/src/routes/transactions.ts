import { Router } from 'express';
import { transactionController } from '../controllers/transactionController';

const router = Router();

router.get('/', transactionController.list);
router.get('/:id', transactionController.get);
router.post('/', transactionController.create);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.remove);

export default router;
