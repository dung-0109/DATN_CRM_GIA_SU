import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }
    
    // Kiểm tra theo profileType (STUDENT, PARENT, TUTOR...) hoặc role gốc của tài khoản
    const activeRole = user.profileType || user.role;

    const hasRole = requiredRoles.includes(activeRole);
    if (!hasRole) {
      throw new ForbiddenException(`Quyền truy cập bị từ chối. Yêu cầu quyền: [${requiredRoles.join(', ')}]. Quyền hiện tại: [${activeRole}]`);
    }
    return true;
  }
}
