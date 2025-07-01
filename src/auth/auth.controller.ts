import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { omit } from 'lodash';
import Lang from '../lang/lang';
import { AuthService } from './auth.service';
import { UserDto } from './dto/add-user.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 🔹 Login and store JWT in HTTP-only Cookie
   */
  @Post('login')
  @ApiOperation({
    summary: Lang.login,
    description: Lang.login_swagger_api,
  })
  @ApiBody({
    description: Lang.user_credential,
    required: true,
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'SecurePassword123!' },
      },
    },
  })
  async login(@Body() body, @Res() res: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user, res);
  }

  /**
   * 🔹 User registration
   */
  @Post('register')
  async register(@Body() userDto: UserDto, @Res() res: Response) {
    try {
      const user = await this.authService.register(userDto);
      return res.status(201).json({
        message: Lang.registration_successful_message,
        user: omit(user, ['password']),
      });
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 🔹 check user logged in or not with JWT Cookie
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request) {
    return { user: omit(req.user, ['password']) };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      await this.authService.verifyEmail(token);
      return res.redirect(`${process.env.NX_FRONTEND_URL}/login?verified=true`); // Redirect to login page after verification
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 🔹 Logout and clear JWT Cookie
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: Lang.logout,
    description: Lang.logout_swagger_api,
  })
  async logout(@Res() res: Response) {
    return this.authService.logout(res);
  }

  /**
   * 🔹 get user by id
   */
  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async getUserById(@Param('id') id: number): Promise<{ user: any }> {
    const user = await this.authService.getUserById(Number(id));
    if (!user) {
      throw new HttpException(
        `Unable to find User with id: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    Logger.log(`Getting User with id: ${id}`);
    return { user: omit(user, ['password']) };
  }

  // Edit user details
  @UseGuards(JwtAuthGuard)
  @Put('edit')
  async edit(@Body() editUserDto: EditUserDto, @Res() res: Response) {
    try {
      const updatedUser = await this.authService.editUser(editUserDto);
      return res.json({
        message: Lang.user_updated_successful_message,
        user: {
          first_name: updatedUser?.first_name,
          last_name: updatedUser?.last_name,
          email: updatedUser?.email,
          about_me: updatedUser?.about_me,
          photo_id: updatedUser?.photo_id,
        },
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-photo')
  async updatePhoto(
    @Body() body: { id: number; photo_id: number },
    @Res() res: Response,
  ) {
    try {
      const updatedUser = await this.authService.editUserPhoto(
        Number(body.id),
        Number(body.photo_id),
      );
      return res.json({
        message: Lang.user_updated_successful_message,
        user: {
          first_name: updatedUser?.first_name,
          last_name: updatedUser?.last_name,
          email: updatedUser?.email,
          about_me: updatedUser?.about_me,
          photo_id: updatedUser?.photo_id,
        },
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string, @Res() res: Response) {
    try {
      const result = await this.authService.forgotPassword(email);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  @Put('reset-password')
  async resetPassword(
    @Body() body: { token: string; newPassword: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.resetPassword(
        body.token,
        body.newPassword,
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() {
    // handled by Passport
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(@Req() req, @Res() res) {
    const user = req.user;
    await this.authService.OAuthLogin(user, 'facebook', res);
    return res.redirect(`${process.env.NX_FRONTEND_URL}/dashboard`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    // This redirects to GitHub OAuth page
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res() res) {
    const user = req.user;
    await this.authService.OAuthLogin(user, 'github', res);
    return res.redirect(`${process.env.NX_FRONTEND_URL}/dashboard`);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // This redirects to Google OAuth page
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = req.user;
    await this.authService.OAuthLogin(user, 'google', res);
    return res.redirect(`${process.env.NX_FRONTEND_URL}/dashboard`);
  }

  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  async steamLogin() {
    // This redirects to Steam page
  }

  @Get('steam/return')
  @UseGuards(AuthGuard('steam'))
  async steamLoginCallback(@Req() req, @Res() res: Response) {
    try {
      Logger.log('Steam Callback req.user:', JSON.stringify(req.user, null, 2));

      const user = req.user;

      if (!user) {
        throw new Error('User not found in Steam callback');
      }

      await this.authService.OAuthLogin(user, 'steam', res);

      const frontendUrl = process.env.NX_FRONTEND_URL;
      Logger.log('Redirecting to:', `${frontendUrl}/dashboard`);

      return res.redirect(`${frontendUrl}/dashboard`);
    } catch (error) {
      Logger.error('Steam Login Callback Error:', error.stack || error.message);
      return res.status(500).send('Steam login failed: ' + error.message);
    }
  }
}
