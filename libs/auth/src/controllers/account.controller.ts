import { UsersService } from '@lib/core';
import { InChangePasswordDto } from '@lib/auth/dto/in-change-password.dto';
import { InConfirmDto } from '@lib/auth/dto/in-confirm.dto';
import { InForgetPasswordDto } from '@lib/auth/dto/in-forget-password.dto';
import { InResetPasswordDto } from '@lib/auth/dto/in-reset-password.dto';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Roles } from '@lib/tenant/decorators/roles.decorator';

@ApiTags('auth')
@Controller('/auth')
export class AccountController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('/confirm')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Confirm account success',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Confirm account failed because: already confirm, expired, wrong code',
  })
  async confirm(@Body() confirmDto: InConfirmDto) {
    return this.usersService.confirm(confirmDto.code);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/forget-password')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reset password initial',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email not existed',
  })
  async resetPasswordInit(@Body() inForgetPasswordDto: InForgetPasswordDto) {
    // TODO send email
    return this.usersService.resetPasswordInit(inForgetPasswordDto.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/reset-password')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reset password success',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email not existed, wrong code or code expired',
  })
  async resetPassword(@Body() inResetPasswordDto: InResetPasswordDto) {
    return this.usersService.resetPassword(
      inResetPasswordDto.email,
      inResetPasswordDto.code,
      inResetPasswordDto.newPassword,
    );
  }

  @ApiBearerAuth()
  @Roles('isActive')
  @HttpCode(HttpStatus.OK)
  @Post('/change-password')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Change password success',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email not existed, password not correct',
  })
  async changePassword(
    @Req() req,
    @Body() inChangePasswordDto: InChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      req.user.id,
      inChangePasswordDto.oldPassword,
      inChangePasswordDto.newPassword,
    );
  }
}
