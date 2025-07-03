import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Postagem } from "../../postagem/entities/postagem.entity";


@Entity ({name: "tb_usuarios"})
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @IsNotEmpty()
    @Column({length:255, nullable: false})
    nome: string;
    
    @IsEmail() //confere se o q foi digitado segue o padrão de e-mail com "@", ".co" etc.
    @IsNotEmpty()
    @Column({length: 255, nullable: false})
    usuario: string;

    @MinLength(8) //mínimo de caracteres aceito
    //@MaxLength(12) limita a quantidade de caracteres do usuário, o que não é tão recomendado para senhas; depende da situação 
    @IsNotEmpty()
    @Column({length: 255, nullable: false })
    senha: string;

    @Column({length: 5000 }) 
    foto: string;

    @OneToMany(() => Postagem, (postagem) => postagem.usuario)
    postagem: Postagem[];
}