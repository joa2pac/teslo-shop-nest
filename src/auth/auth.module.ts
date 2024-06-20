import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    TypeOrmModule.forFeature([ User ]),

  PassportModule.register({ defaultStrategy: 'jwt' }),

  JwtModule.registerAsync({
    imports: [ ConfigModule ],
    inject: [ ConfigService ],
    useFactory: ( configService: ConfigService) => {
      // console.log('JWT SECRET', process.env.JWT_SECRET)
      return {
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '2h'
        }
      }
    }
  })

  ],
  exports: [ TypeOrmModule ],
})
export class AuthModule {}
