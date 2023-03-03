import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import * as multer from "multer";
import { v4 as uuidv4 } from "uuid";
import * as sharp from "sharp";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { EditUserService } from "./editUser.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guards";
import { EditUserDto } from "./dto/edit-user.dto";

@UseGuards(JwtAuthGuard)
@Controller("editUser")
export class EditUserController {
  constructor(private editUserService: EditUserService) {}

  // update user name
  @Patch("/updateName")
  async editUser(
    @Req() req: Request,
    @Body() dto: EditUserDto,
    @Res() res: Response
  ) {
    const userEmail = req.user["email"];
    const updatedData = await this.editUserService.updateNameByEmail(
      userEmail,
      dto
    );
    return res.status(HttpStatus.OK).json({
      message: "success",
      data: {
        updatedData,
      },
    });
  }

  // get user info
  @Get("me")
  async me(@Req() req: Request, @Res() res: Response) {
    const userEmail = req.user["email"];
    const userData = await this.editUserService.findByEmail(userEmail);
    return res.status(HttpStatus.OK).json({
      message: "success",
      data: {
        userData,
      },
    });
  }

  // upload avatar
  @Patch("upload")
  // set multer middleware
  @UseInterceptors(
    FileInterceptor("file", {
      storage: multer.memoryStorage(),
    })
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // set file name
    const filename = `user-${uuidv4()}.jpeg`;

    // resize image
    const fileBuffer = await sharp(file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();

    // S3 upload
    const bucketName = process.env.BUCKET_NAME;
    const bucketRegion = process.env.BUCKET_REGION;
    const accessKey = process.env.ACCESS_KEY as string;
    const secretAccessKey = process.env.SECRET_ACCESS_KEY as string;

    const s3Clinet = new S3Client({
      region: bucketRegion,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
      },
    });

    await s3Clinet.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Body: fileBuffer,
        Key: filename,
        ContentType: file.mimetype,
      })
    );

    // get user email from jwt token
    const userEmail = req.user["email"];

    // update avatar in db
    const updatedAvatar = await this.editUserService.updateAvatarByEmail(
      userEmail,
      {
        avatar: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${filename}`,
      }
    );

    return res.status(HttpStatus.OK).json({
      message: "success",
      data: {
        avatar: updatedAvatar,
      },
    });
  }
}

// <img src=`public/{avatarFileName}`>
