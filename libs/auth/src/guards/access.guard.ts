import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@lib/core';

@Injectable()
export class AccessGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    // TODO why this: just login user
    // So don't need to create separate guard and
    // But this lead to always return 403 instead of some cases they are 401
    // TODO don't use this. Debug too hard
    try {
      await super.canActivate(context);
    } catch (error) {
      // ignore error
      // Logger.error('Error in canActivate', error.message, AccessGuard.name);
    }
    const roles = [
      ...(this.reflector.get<string[]>('roles', context.getHandler()) || []),
      ...(this.reflector.get<string[]>('roles', context.getClass()) || []),
    ];
    const permissions = [
      ...(this.reflector.get<string[]>('permissions', context.getHandler()) ||
        []),
      ...(this.reflector.get<string[]>('permissions', context.getClass()) ||
        []),
    ];
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const hasRole =
      roles.length > 0
        ? roles.filter(
            roleName => user && user instanceof User && user[roleName],
          ).length > 0
        : null;
    const hasPermission =
      permissions.length > 0
        ? user && user instanceof User && user.checkPermissions(permissions)
        : null;

    return (
      hasRole === true ||
      hasPermission === true ||
      (hasRole === null && hasPermission === null)
    );
  }
}
