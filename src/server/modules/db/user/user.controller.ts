import { Controller, Get, Post, Body, Res, Request, Inject } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
    constructor(
        private readonly usersService: UserService
    ) { }

    @Post('create')
    async create(@Body() userDto: UserDto) {
        console.log('create root! :');
        this.usersService.create(userDto);
    }

    @Get('find-by-id/')
    async getUserById(@Request() req: any): Promise<any[]> {
        const user = await this.usersService.getUserById (req.query.id);
        console.log('user :', user);
        return user;
    }
}
