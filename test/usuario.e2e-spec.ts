/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Testes dos Módulos Usuário e Auth (e2e)', () => {
  let app: INestApplication;
  let token: any;
  let usuarioId: any;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:', //nao tem endereço como o mysql; gera dados na memoria da aplicação q depois será apagado
          entities: [__dirname + './../src/**/entities/*.entity.ts'],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); //ativa requisitos/validações de dados (e-mail x, senha com min caracteres etc)

    await app.init();
  });

  //depois de rodar todos os testes, fecha aplicação
  afterAll(async () => {
    await app.close();
  });

  it('01 - Deve cadastrar um novo usuário', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(201);

    usuarioId = resposta.body.id;
  });

  it('02 - Não deve cadastrar um usuário duplicado', async () => {
    return await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(400);
  });

  it('03 - Deve autenticar o usuário (login)', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({
        usuario: 'root@root.com',
        senha: 'rootroot',
      })
      .expect(200);

    token = resposta.body.token;
  });

  it('04 - Deve listar todos os usuários', async () => {
    return await request(app.getHttpServer())
      .get('/usuarios/all')
      .set('Authorization', `${token}`)
      .expect(200);
  });

  it('05 - Deve atualizar um usuário', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const resposta = await request(app.getHttpServer())
      .put('/usuarios/atualizar')
      .set('Authorization', `${token}`)
      .send({
        id: usuarioId,
        nome: 'Root atualizado',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(200)
      .then((resposta) => {
        expect('Root atualizado').toEqual(resposta.body.nome);
      });
  });

  describe('Testes dos Módulos Tema e Postagem (e2e)', () => {
    let temaID: any;
    //let postagemID: any;

    it('01 - Deve criar um novo tema', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/temas')
        .set('Authorization', `${token}`)
        .send({
          descricao: 'tema novo',
        })
        .expect(201);

      temaID = resposta.body.id;
    });

    it('02 - Deve criar uma nova postagem', async () => {
      return await request(app.getHttpServer())
        .post('/postagens')
        .set('Authorization', `${token}`)
        .send({
          titulo: 'título novo',
          texto: 'texto do post',
          tema: temaID,
          usuario: usuarioId,
        })
        .expect(201);

      //postagemID = resposta.body.id;
    });

    it('03 - Deve apresentar erro ao atualizar postagem com id inválido', async () => {
      return await request(app.getHttpServer())
        .put('/postagens')
        .set('Authorization', `${token}`)
        .send({
          id: 30,
          titulo: 'título novo',
          texto: 'texto do post',
          tema: temaID,
          usuario: usuarioId,
        })
        .expect(404);
    });

    it('04 - Deve apresentar erro ao excluir tema com ID inválido', async () => {
      return await request(app.getHttpServer())
        .delete('/temas')
        .set('Authorization', `${token}`)
        .send({
          id: 25,
        })
        .expect(404);
    });
  });
});
