import { Router } from 'express';
import { createTeam, getTeam, inviteUser } from '../controllers/team.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);

router.post('/', requireRole('admin', 'user'), createTeam);
router.get('/:id', requireRole('admin', 'user', 'viewer'), getTeam);
router.post('/:id/invite', requireRole('admin'), inviteUser);

export default router;
