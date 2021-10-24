import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
constructor(private readonly userCons: UserService){}


    @Post('/register/')
    regUser(@Body() user:any ){
    console.log(user);
    return this.userCons.addUser(user);
    
    }

    @Get('/all/')
    getAllUser(){
        console.log("All users output");
        return this.userCons.printAllUsers();
    }

    @Get('/:userID')
    userQuery(@Param('userID') userID: string){
        return this.userCons.userQuery(userID);
    }

    @Put('/:userID')
    amendData(@Param('userID') userID: string, @Body() user:any){

        return this.userCons.editUserData(user, userID);
        
    }

    @Delete('/:userID')
    deleteAcc(@Param('userID') userID: string){
        

        return this.userCons.deleteAccount(userID);
       
        
    }

    @Post('/login')
    authProcess(@Body() body:any){
        console.log(body);
        return this.userCons.authFunction(body);
    }
    

    @Patch('/:userID')
    patchCreds(@Param('userID') userID: string, @Body() userBody:any){
      
        //console.log("Controller PATCH PARAM: " +parsedID);

        console.log("Finding id: " + userID);
        
        return this.userCons.patchFunc(userID, userBody);
        
    }

    @Get('/search/:term')
    wideSearch(@Param('term') term: string){
        console.log("Searching for: " + term);
    return this.userCons.broadSearch(term);
    }

    
}


