import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  healthCheck() {
    return 'ok';
  }

  @Public()
  @Get()
  root() {
    return 'ok';
  }
}

