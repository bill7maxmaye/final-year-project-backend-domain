/* eslint-disable prettier/prettier */
import {  Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('')
export class AppController {
  constructor(
    private configService: ConfigService,
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
    private readonly reservationsService: AppService,
  ) {}

  @Get("/")
  test(){
    return "Hello World";
  }
}
