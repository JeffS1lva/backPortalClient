# Aprendendo Docker (Diego Fernandes)

- Um dos principais pontos do docker é que ele pode rodar a aplicação em qualquer lugar, sem se preocupar com diferenças de sistemas operacionais. (Linux, Mac, Windows e servidor.)
- Uma das diferenças também é o isolamento dos apps, pois pra cada app ele roda em um container diferente sem interferir nas demais aplicações. 
- Importante lembrar que docker também é openSource. Ou seja o código-fonte do docker está totalmente disponivel para saber como ele foi feito. 


### Docker-compose 

- Docker-compose e basicamente um arquivo de receita, dentro desse arquivo terá exatamente quais serviços a nossa aplicação precisa.
- A porta padrão do docker sempre é: ```5432```
- Nele vai as configurações principais, para rodar e conectar com o docker e o banco de dados.

- Uma das vantagens excelentes, e não precisar instalar pacote do node no próprio vscode. Ao usar o docker e inserindo as configurações no docker-compose/dockerfile. Ao dar ```docker-compose up -d --build```, ele já começa a rodar o próprio node no docker. Sem ter necessidade de instalar ele no vscode.

### Configurações ```Docker-compose.yml``` e ```Dockerfile```

## Docker-compose.yml

```docker-compose.yml

services:
  db:
    image: postgres:16-alpine
    container_name: portal-db
    restart: always
    environment:
      POSTGRES_USER: portaluser
      POSTGRES_PASSWORD: portalpass
      POSTGRES_DB: portaldb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    container_name: portal-backend
    restart: always
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      - db

  adminer:
    image: adminer
    container_name: portal-adminer
    restart: always
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  postgres_data:

``` 

### 1️⃣ db (PostgreSQL)
- Container do banco de dados usando a imagem `postgres:16-alpine`.
- Porta padrão **5432**, usuário, senha e nome do banco configurados via variáveis de ambiente.
- Volume `postgres_data` mantém os dados mesmo se o container for removido.

### 2️⃣ backend (Node.js)
- Container do backend, construído a partir do Dockerfile do projeto.
- Porta **3000** exposta para acessar a aplicação via `http://localhost:3000`.
- Usa variáveis do arquivo `.env` e depende do container do banco (`db`) estar iniciado.

### 3️⃣ adminer (UI PostgreSQL)
- Interface visual leve para gerenciar o banco de dados.
- Porta **8080** para acessar via navegador (`http://localhost:8080`).
- Permite executar comandos SQL, criar tabelas e visualizar dados.
- Depende do container `db` estar iniciado.


## Dockerfile

- O Dockerfile serve para **definir como construir a imagem do container** do backend.  
- Ele especifica a **imagem base**, instala dependências e copia o código do projeto.  
- Também define a **porta que a aplicação vai usar** e o **comando para iniciar o backend**.


```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

```
## Dockerfile - Comandos e Funções

| Comando                | Função / Objetivo                                         |
|------------------------|-----------------------------------------------------------|
| `FROM node:18-alpine`  | Define a imagem base leve do Node.js 18                  |
| `WORKDIR /app`         | Define o diretório de trabalho dentro do container       |
| `COPY package*.json ./`| Copia arquivos de dependências para instalar antes do código |
| `RUN npm install`      | Instala as dependências do projeto                        |
| `COPY . .`             | Copia todo o código do projeto para o container           |
| `EXPOSE 3000`          | Expõe a porta 3000 para acesso externo                    |
| `CMD ["npm","start"]`  | Define o comando padrão para iniciar a aplicação          |


### Acesso para Adminer

- Para acessar painel pra visualizar tabelas, precisa ser com o que foi definido no docker e no .env, se não ele não vai funcionar. 
```.env

DB_USER=example
DB_PASSWORD=123
DB_HOST=db (Se tiver no vscode, ele deve ser localhost. Se node tiver rodando no docker deve ser db.)
DB_PORT=5432
DB_DATABASE=example

```