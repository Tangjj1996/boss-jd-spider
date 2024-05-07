import { Controller, Get } from '@nestjs/common';
import { SpiderService } from './spider.service';

@Controller('spider')
export class SpiderController {
  constructor(private readonly appService: SpiderService) {}

  @Get()
  startSpider() {
    this.startSpider;
    return '爬虫启动';
  }
}
