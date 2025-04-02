import { Controller, Post, Body, Get, Param, Res, Query, HttpException, HttpStatus } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import {  Response } from 'express';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body('email') email: string) {
    return this.newsletterService.subscribe(email);
  }

  @Get('confirm/:token')
  confirm(@Param('token') token: string, @Res() res: Response) {
    try {
      this.newsletterService.confirmSubscription(token);
      return res.redirect(`${process.env.NX_FRONTEND_URL}`); 
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}
