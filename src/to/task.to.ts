import {IsEmail, IsNotEmpty, min, MinLength} from "class-validator";

export class TaskTo {

    public id!: number;
    @IsNotEmpty({message: "Description can not be empty!"})
    @MinLength(3, {message: "Description should be at least 3 characters long"})
    public description!: string;
    public status!: boolean;
    @IsEmail({}, {message: "Invalid Email!, Try again!"})
    public email!: string;

}