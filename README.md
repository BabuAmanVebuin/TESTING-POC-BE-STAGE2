# nodejs-backend-template

Standardized template for nodejs backend projects based on Clean Architecture.

## Directory structure

Based on [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).

```
src/
├── application/
│   ├── errors/
│   │   ├── MissingRequiredParameterError.ts
│   │   ├── TaskIDAlreadyExistsError.ts
│   │   ├── TaskIDDoesntExistError.ts
│   │   └── index.ts
│   ├── port/
│   │   └── repositories/
│   │       └── TaskRepositoryPort.ts
│   └── use_cases/
│       ├── createTaskUseCase.ts
│       ├── deleteTaskUseCase.ts
│       ├── findAllTasksUseCase.ts
│       ├── findTaskByIdUseCase.ts
│       └── updateTaskUseCase.ts
├── domain/
│   └── models/
│       └── Task.ts
├── infrastructure/
│   ├── env/
│   │   └── index.ts
│   ├── orm/
│   │   └── typeorm/
│   │       ├── config/
│   │       │   └── ormconfig.ts
│   │       └── entities/
│   │           └── Task.ts
│   ├── repositories/
│   │   ├── taskRepositoryInMemory.ts
│   │   └── taskRepositoryMySQL.ts
│   └── webserver/
│       └── express/
│           └── index.ts
└── interface/
    ├── controllers/
    │   ├── createTaskController.ts
    │   ├── deleteTaskController.ts
    │   ├── findAllTasksController.ts
    │   ├── findTaskByIdController.ts
    │   └── updateTaskController.ts
    └── routes/
        ├── apiDocs.ts
        ├── createTask.ts
        ├── deleteTask.ts
        ├── findAllTasks.ts
        ├── findTaskById.ts
        ├── index.ts
        ├── updateTask.ts
        └── util.ts
```

## Packages

We need this section because we've been facing a problem caused by minor update of package such as parcel...

### How to add a package for runtime

```sh
# Install the package as exact version in dependencies.
$ yarn add --exact PACKAGE_NAME
```

### How to add a package for development

```sh
# Install the package as exact version in devDependencies.
$ yarn add -D --exact PACKAGE_NAME
```

### How to add a package for the type definition (@types/PACKAGE_NAME)

```sh
# Install the package as exact version in devDependencies.
$ yarn add -D --exact PACKAGE_NAME
```

### How to update a package

```sh
$ yarn add PACKAGE_NAME
```

## Development

1. Install node_modules locally.

    ```bash
    $ yarn
    ```

1. Start containers.

You can choose one of:

    ```bash
    # Using existing containers.
    $ yarn container:start
    ```

    ```bash
    # Build containers before starting.
    $ yarn container:start --build
    ```

    ```bash
    # Remove images and containers and rebuild them before starting.
    $ yarn container:start:rebuild
    ```

1. Add some new changes.

## Environment variables

Refer to `./docker/<SERVICE_NAME>.dev.env` if you need to modify the environment variables for local development. Those files are used in `./docker/docker-compose.yml` using **env_file** configuration option following [this official document](https://docs.docker.com/compose/environment-variables/#the-env_file-configuration-option).

## How to create and run a migration (TypeORM)

    Before executing the following scripts, change the value of environment variable `DB_HOST` to `localhost`.

    ```bash
    # Create a new migration
    $ yarn typeorm-cli migration:generate -n Task

    # Run migrations
    $ yarn typeorm-cli migration:run
    ```

## Development tools

- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [Jest](https://jestjs.io/)
- [TypeORM](https://typeorm.io/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [husky](https://typicode.github.io/husky/#/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [nodemon](https://nodemon.io/)

## Packages Management

ライブラリ一覧を[Excelファイル](https://jeragroup.sharepoint.com/:x:/r/sites/JE_Esp0240_JA010/DocLib/02_Program/03_Document/11_System_Operation%26Maintenance/02_Document/11_%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E5%85%A8%E4%BD%93%E8%A8%AD%E8%A8%88%E6%9B%B8/DPP%E3%83%8F%E3%82%99%E3%83%83%E3%82%AF%E3%82%A8%E3%83%B3%E3%83%88%E3%82%99%E4%B8%80%E8%A6%A7.xlsx?d=wf1ba5436f65c47358f574b7cf67e3331&csf=1&web=1&e=iBzfqA)にまとめてあります。
ライブラリのバージョンは左記Excelファイルで管理しています。DPPのバックエンドレポジトリ（DCD-BE、MTS-BE、OPS-BE、PTM-BE）で同じライブラリが使用されている場合は、すべて同じバージョンを利用しています。ライブラリを追加・更新する際は下記手順によって、更新してください。
1. 作業中のレポジトリでライブラリを追加またはアップデートする（バージョンは特別な理由がない限り、最新のバージョンを利用すること）
2. ライブラリ一覧のExcelファイルで他のレポジトリにて、同じライブラリが使用されているかどうかを確認する
3. 使用している場合、バージョンが過去のバージョンである場合は最新バージョン（新しくライブラリを追加したレポジトリと同じバージョン）へバージョンアップする
4. Excelファイルへ新しくライブラリを追加したレポジトリの情報と、バージョンアップしたレポジトリの情報を追記・更新する


## AI Test Case Generation Setup

For AI automation, please follow the steps below:

### 1. Required Libraries Installation
Install the following dependencies:

   - `openai`
   - `fs`
   - `path`
   - `dotenv`

### 2. Creating Typescript File
Please create a `.ts` file in the root directory (you can choose any name).

### 3. Update the package.json for Test Command:
Update the `package.json` file with the required test commands.
```sh
"test:generate": "ts-node autoGenerateTests.ts"
```

### 4. Modify AI Generate File
Update the `autoGenerateTests.ts` file with the necessary logic.

### 5. Reference Details
For more information, please refer to `autoGenerateTestsReadMe.md`.

