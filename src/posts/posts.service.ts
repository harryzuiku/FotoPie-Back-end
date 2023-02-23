
import { ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Posts, PostDocument } from './schema/post.schema';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/user.service';
import { PostDTO } from './dto/post.dto';
import { User, UserDocument } from "../user/schemas/user.schema";
// const slugify = require(slugify)

@Injectable()
export class PostsService {

    constructor(
        @InjectModel(Posts.name) private readonly postModel: Model<PostDocument>,
        // private userService: UserService

    ) { }

    // public async create(user: User, PostDTO: PostDTO){
    //     const post = await this.postModel.create(PostDTO, user:User)
    //     return post
    // }

  







    
}
