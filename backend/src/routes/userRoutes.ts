import express, { Request, Response, NextFunction } from 'express'
import { getAllUser, getUserById, updatePassword, updateUser } from '../controllers/userController'
const router = express.Router()

// Wrap async controller functions to handle promises properly
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', asyncHandler(getAllUser))

router.get('/:id', asyncHandler(getUserById))

router.post('/:id', asyncHandler(updateUser))

router.post('/:id/password', asyncHandler(updatePassword))

export default router
