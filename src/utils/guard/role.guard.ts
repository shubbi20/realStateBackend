import { SetMetadata } from '@nestjs/common';
import { ERole } from 'src/Module/user/user.service';

export const ROLES_KEY = 'roles';
export const RoleGuard = (...roles: ERole[]) => SetMetadata(ROLES_KEY, roles);
