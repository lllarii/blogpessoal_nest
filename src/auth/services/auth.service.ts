import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Bcrypt } from '../bcrypt/bcrypt';
import { UsuarioService } from './../../usuario/services/usuario.service';
import { UsuarioLogin } from './../entities/usuariologin.entity';

@Injectable()
export class AuthService {
  constructor(
    private UsuarioService: UsuarioService,
    private jwtService: JwtService,
    private bcrypt: Bcrypt,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const buscaUsuario = await this.UsuarioService.findByUsuario(username);

    if (!buscaUsuario)
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);

    const matchPassword = await this.bcrypt.compararSenhas(
      password,
      buscaUsuario.senha,
    );

    if (buscaUsuario && matchPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { senha, ...resposta } = buscaUsuario;
      return resposta;
    }
    return null;
  }

  async login(usuarioLogin: UsuarioLogin) {
    const payload = { sub: usuarioLogin.usuario };

    const buscaUsuario = await this.UsuarioService.findByUsuario(
      usuarioLogin.usuario,
    );

    // if (!buscaUsuario)
    //   throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    //caso não queira adicionar ?, use o if

    return {
      id: buscaUsuario?.id,
      nome: buscaUsuario?.nome,
      usuario: usuarioLogin.usuario,
      senha: '',
      foto: buscaUsuario?.foto,
      token: `Bearer ${this.jwtService.sign(payload)}`,
    };
  }
}
