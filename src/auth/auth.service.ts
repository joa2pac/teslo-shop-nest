import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt'

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt.interface';

@Injectable()
export class AuthService {

constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,

  private readonly jwtService: JwtService
) {}

  async create(createUserDeto: CreateUserDto) {
    
    try {

      const { password, ...userData } = createUserDeto

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 10)
      });

      await this.userRepository.save( user );
      
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ email: user.email })
      }; 

    } catch(error) {
      this.handleDBerrors(error);
    }
    
  }


async login(loginUserDto: LoginUserDto) {


  const {email, password} = loginUserDto;

  const user = await this.userRepository.findOne({
    where: { email },
    select: { email: true, password: true }
  });

  if( !user ) 
    throw new UnauthorizedException('Not valid credentials(email)');
  

  if ( !bcrypt.compareSync( password, user.password ) )
    throw new UnauthorizedException('Not valid credentials(password)');

  return {
    ...user,
    token: this.getJwtToken({ email: user.email })
  };

}

private getJwtToken( payload: JwtPayload ) {

  const token = this.jwtService.sign( payload );
  return token;

}

private handleDBerrors(error: any): never {

    if(error.code === "23505") {
    throw new BadRequestException( error.detail );
    }

    console.log(error);

    throw new InternalServerErrorException('Please check server logs')

    }
  
}
