import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tema } from "./entities/tema.entity";
import { PostagemService } from "./services/postagem.service";
import { PostagemController } from "./controllers/postagem.controller";

@Module({
    imports:[TypeOrmModule.forFeature([Tema])],
    providers: [PostagemService],
    controllers: [PostagemController],
    exports: [],
})
export class TemaModule {}