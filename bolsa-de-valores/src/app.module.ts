import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LivroOfertasService } from './livro-ofertas.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, LivroOfertasService],
})
export class AppModule {}
