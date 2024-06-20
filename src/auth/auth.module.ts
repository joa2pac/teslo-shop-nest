import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    TypeOrmModule.forFeature([ User ]),

  PassportModule.register({ defaultStrategy: 'jwt' }),

  ],
  exports: [ TypeOrmModule ],
})
export class AuthModule {}
