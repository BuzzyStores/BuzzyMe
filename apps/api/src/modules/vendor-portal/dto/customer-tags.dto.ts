import { IsArray, IsString } from "class-validator";

export class CustomerTagsDto {
  @IsArray()
  @IsString({ each: true })
  tags!: string[];
}
