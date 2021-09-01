
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './configs/winston.config'

async function bootstrap() {

  const logger = WinstonModule.createLogger(winstonConfig);
  const app = await NestFactory.create(AppModule, { cors: true, logger });

  console.log(`ambiente:${process.env.NODE_ENV}`);
  console.log(process.env.API_PORT);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.BROKER_KAFKA],
      },
      consumer: {
        groupID: 'my-consumer-' + Math.random(), 
      }
    }
  });

  //Configuracao do Swagger - Header
  const config = new DocumentBuilder()
    .setTitle('BoilerPlate')
    .setDescription( 'informar descricao')
    .setVersion('1.0')
    .addTag('Kafka')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
