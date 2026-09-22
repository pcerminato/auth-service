import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './app.service.js';
import { AuthGuard } from '@nestjs/passport';
import { AuthDto, LoginDto } from './dto/index.js';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signin')
  signIn(@Body() data: AuthDto) {
    return this.authService.register(data.email, data.password, data.name);
  }
  @Post('login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data.email, data.password);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('profile/:user_id')
  async getProfile(@Param('user_id') id: string) {
    return await this.authService.getProfile(id);
  }
}
