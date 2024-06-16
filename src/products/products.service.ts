import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isUUID } from 'uuid';

import { Product } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

constructor(

  @InjectRepository(Product) 
  private readonly productRepository: Repository<Product>

) {}


  async create(createProductDto: CreateProductDto) {
    
try {

  // if( !createProductDto.slug ) {
  //   createProductDto.slug = createProductDto.title
  //     .toLowerCase()
  //     .replaceAll(' ','_')
  //     .replaceAll("'",'')
  // } else {
  //   createProductDto.slug = createProductDto.slug
  //     .toLowerCase()
  //     .replaceAll(' ','_')
  //     .replaceAll("'",'')
  // }

const product = this.productRepository.create(createProductDto);
await this.productRepository.save( product );

return product;
} catch(error){
this.handleDBExceptions(error)
}

  }

  findAll(paginationDto: PaginationDto) {

const {limit = 10, offset = 0} = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset,
    })
  }

   async findOne(term: string) {
  
    let product: Product;

if( isUUID(term) ) {
  product = await this.productRepository.findOneBy({id: term});
} else {
  product = await this.productRepository.findOneBy({slug: term});
}

    // const product =  await this.productRepository.findOneBy({id});

    if(!product)
      throw new NotFoundException(`Product with id ${term} not found`);
    
      return product;	
    

  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    
  }

  async remove(id: string) {
   const product = await this.findOne(id)

   await this.productRepository.remove(product)
  }

private handleDBExceptions(error: any) {

  if ( error.code === '23505' )
    throw new BadRequestException(error.detail); 
  
  this.logger.error(error);
  throw new InternalServerErrorException('Unexpected error, check server logs');

}

}
