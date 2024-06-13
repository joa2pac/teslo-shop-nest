import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

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

  findAll() {
    return this.productRepository.find({})
  }

   async findOne(id: string) {
  
    const product =  await this.productRepository.findOneBy({id});

    if(!product)
      throw new NotFoundException(`Product with id ${id} not found`);
    
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
