import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { GroupsService, User } from '@lib/core';
import { plainToClass } from 'class-transformer';
import { Strategy } from 'passport-jwt';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { TokenService } from '../services/token.service';
import { TENANT_ID_HEADER } from '@lib/tenant/const';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly tokenService: TokenService,
    private readonly groupsService: GroupsService,
  ) {
    super({
      passReqToCallback: true,
      jwtFromRequest: req => {
        const token = this.tokenService.extractTokenFromRequest(req);
        // Logger.log(token, JwtStrategy.name);
        return token;
      },
      secretOrKeyProvider: (req, token, done) => {
        const secretKey = this.tokenService.createSecretKey(
          plainToClass(User, this.tokenService.decode(token)),
        );
        done(null, secretKey);
      },
    });
  }

  public async validate(req, payload: IJwtPayload) {
    try {
      await this.groupsService.preloadAll();
    } catch (error) {
      throw new BadRequestException('Error in load groups');
    }
    try {
      const user = plainToClass(User, payload);

      if (
        req.headers[TENANT_ID_HEADER] !== user.tenant.path &&
        req.headers[TENANT_ID_HEADER] !== 'master'
      ) {
        throw new UnauthorizedException('Wrong tenantId');
      }

      user.groups = user.groups.map(group =>
        this.groupsService.getGroupByName({ name: group.name }),
      );

      return user;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
