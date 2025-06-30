import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import Lang from '../lang/lang';
import { MailerService } from '../mailer/mailer.service';
import { Helper } from '../utils/helper';
import { UserDto } from './dto/add-user.dto';
import { EditUserDto } from './dto/edit-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private prisma: PrismaService,
  ) {}
  private helper = new Helper();

  /**
   * 🔹 Validate User Credentials
   */
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { photo: true },
    });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException(Lang.invalid_password);
    }

    //  ## disbaled loing with email verification for time being
    if (!user.is_verified) {
      throw new UnauthorizedException(Lang.email_not_verify);
    }

    return user;
  }

  /**
   * 🔹 Login - Stores JWT in Secure HTTP-Only Cookie
   */
  async login(user: any, res: Response) {
    const payload = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      about_me: user.about_me,
      photo_id: user.photo_id,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });

    return res.json({
      message: Lang.login_successful_message,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  }

  /**
   * 🔹 oauth Login - Stores JWT in Secure HTTP-Only Cookie
   */
  async OAuthLogin(profile: any, provider: string, res: Response) {
    const providerId = profile.id;
    const email = profile.email || null; // Steam doesn't provide email
    const firstName =
      profile.firstName || profile.username || profile.name || 'Unknown';
    const lastName = profile.lastName || '';
    const verification_token = crypto.randomBytes(32).toString('hex');

    let user: any = null;

    // 🔍 1.Check if provider account is already linked
    const linkedAccount = await this.prisma.userProvider.findUnique({
      where: {
        provider_provider_id: {
          provider,
          provider_id: providerId,
        },
      },
      include: { user: true },
    });

    if (linkedAccount) {
      user = linkedAccount.user;
    } else if (email) {
      // 🔗 2. Check if user exists with email, link new provider
      user = await this.prisma.user.findUnique({ where: { email } });

      if (user) {
        await this.prisma.userProvider.create({
          data: {
            provider,
            provider_id: providerId,
            user_id: user.id,
          },
        });
      }
    }

    // 🆕 3. Register new user if not found
    if (!user) {
      const fallbackEmail = email ?? `${provider}_${providerId}@noemail.local`;

      user = await this.prisma.user.create({
        data: {
          email: fallbackEmail,
          first_name: firstName,
          last_name: lastName,
          password: bcrypt.hashSync('social_login', 10),
          //  is_verified: !!email, // mark verified only if email present
          is_verified: email ? false : true,
          verification_token: email ? verification_token : null,
          userProviders: {
            create: {
              provider,
              provider_id: providerId,
            },
          },
        },
      });
    }

    if (email) {
      const verificationUrl = `${process.env.NX_API_BASE_URL}/auth/verify-email?token=${verification_token}`;
      await this.sendEmail(
        user?.email,
        Lang.verification_email_subject,
        `${user?.first_name} ${user?.last_name}`,
        verificationUrl,
        'verification_email_body',
      );
    }

    // 🎟️ 4. Generate and set JWT token
    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });

    // 🔁 5. Redirect based on profile completeness
    // if (!email) {
    //   return res.redirect(`${process.env.CLIENT_URL}/complete-profile?token=${token}`);
    // }
  }

  /**
   * 🔹 Register User
   */
  async register(userDto: UserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userDto?.email },
    });
    if (existingUser) {
      throw new Error(Lang.email_exist_message);
    }

    const hashedPassword = bcrypt.hashSync(userDto?.password, 10);
    const verification_token = crypto.randomBytes(32).toString('hex');
    const user = await this.prisma.user.create({
      data: {
        first_name: userDto?.first_name,
        last_name: userDto?.last_name,
        email: userDto?.email,
        password: hashedPassword,
        is_verified: false,
        verification_token,
      },
    });
    const verificationUrl = `${process.env.NX_API_BASE_URL}/auth/verify-email?token=${verification_token}`;
    await this.sendEmail(
      user?.email,
      Lang.verification_email_subject,
      `${userDto?.first_name} ${userDto?.last_name}`,
      verificationUrl,
      'verification_email_body',
    );

    return {
      message: Lang.registration_successful_message,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }

  /**
   * 🔹 Verify Email
   */
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verification_token: token },
    });
    if (!user) throw new UnauthorizedException(Lang.invalid_token_message);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { is_verified: true, verification_token: null },
    });

    return { message: Lang.verification_success_message };
  }

  /**
   * 🔹 Logout - Clears JWT Cookie
   */
  async logout(res: Response) {
    res.clearCookie('jwt');
    return res.json({ message: Lang.logout_success_message });
  }

  /**
   * 🔹 Edit User
   */
  async editUser(editUserDto: EditUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: editUserDto?.email },
    });
    if (!user) {
      throw new NotFoundException(Lang.user_not_found_message);
    }

    return await this.prisma.user.update({
      where: { email: editUserDto?.email },
      data: {
        first_name: editUserDto?.first_name,
        last_name: editUserDto?.last_name,
        email: editUserDto?.email,
        about_me: editUserDto?.about_me,
      },
    });
  }

  async editUserPhoto(id: number, photo_id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(id) },
    });
    if (!user) {
      throw new NotFoundException(Lang.user_not_found_message);
    }

    return await this.prisma.user.update({
      where: { id: Number(id) },
      data: {
        photo_id: Number(photo_id),
      },
    });
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      include: { photo: true },
    });

    if (!user) {
      throw new NotFoundException(Lang.user_not_found_message);
    }

    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error(Lang.account_not_found_message);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);

    const updated_user = await this.prisma.user.update({
      where: { email },
      data: {
        reset_password_token: token,
        reset_password_expires: expires,
      },
    });

    // Send email
    const resetUrl = `${process.env.NX_FRONTEND_URL}/reset-password/${updated_user?.reset_password_token}`;
    await this.mailerService.sendMail(
      email,
      Lang.reset_email_subject,
      this.helper.reset_password_email_body(
        resetUrl,
        `${user?.first_name} ${user?.last_name}`,
      ),
    );

    return { message: Lang.password_reset_email };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) throw new Error(Lang.invalid_expire_token);

    const password = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: password,
        reset_password_token: null,
        reset_password_expires: null,
      },
    });
    if (!updatedUser) {
      throw new Error(Lang.password_updated_failed_message);
    }

    return { message: Lang.password_updated_successful_message };
  }

  private async sendEmail(
    email: string,
    subject: string,
    name: string,
    link: string,
    emailType: string,
  ) {
    if (this.helper[emailType]) {
      await this.mailerService.sendMail(
        email,
        subject,
        this.helper[emailType](link, `${name}`),
      );
    } else {
      throw new Error(`Invalid email type: ${emailType}`);
    }
  }
}
