import { IsString } from "class-validator";

export class CustomerNotesDto {
  @IsString()
  notes!: string;
}
