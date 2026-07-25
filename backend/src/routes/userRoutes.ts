import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
  changeUserStatus,
} from '../controllers/userController';

const router = Router();

// Enterprise Admin User Management API Routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/role', changeUserRole);
router.patch('/:id/status', changeUserStatus);

export default router;
