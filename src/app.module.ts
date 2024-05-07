import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './spider/entities/Job';
import { SpiderService } from './spider/spider.service';
import { SpiderController } from './spider/spider.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'jianjie',
      database: 'boss-spider',
      synchronize: true,
      logging: true,
      entities: [Job],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugins: 'sha256_password',
      },
    }),
  ],
  controllers: [SpiderController],
  providers: [SpiderService],
})
export class AppModule {}
