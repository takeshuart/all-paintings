# 别名导入有问题，改为相对路径：
'@/db/models/ArtworkColorFeature.js' -> '../db/models/ArtworkColorFeature.js'

# 命名规范
- Files & Folders	   kebab-case	      user.routes.js, auth.service.js
- Variables	         camelCase	      const userName = 'John';
- Constants	         UPPER_SNAKE_CASE	const MAX_USERS = 100;
- Classes	         PascalCase	      class UserService {}
- Functions	         camelCase	      getUserById()
- Routes	            Plural nouns	   /api/v1/users
- Route Parameters	camelCase 	      req.params.userId, /users/:user_id (in code, snake_case in URLs)
- Database Tables	   snake_case	      user_profiles
- Environment Vars	UPPER_SNAKE_CASE	DB_HOST=localhost
- Scripts            underline         diff_image.ts

# Tech stack
- SQLite
   数据文件: artwork-database\artwork.db
   数据写入脚本：`artwork\vangogh.ts`
   客户端工具：[DB Browser for SQLite](https://github.com/sqlitebrowser)
- nedb
   记不清这个数据库的作用了，可能在技术选型中临时测试过。
   

#　How to run?
该项目包含2个子项目：

1. 运行单个文件
   - `> tsc`命令编译文件
   - vscode: `run->start debugging` ,运行当前打开的`.ts`文件
    （原理：`.vscode/launch.json`已配置`ts-node ESM`）

   - 编译`npm run build`

 -命令行运行 ：`node --loader ts-node/esm ./src/scripts/compute_color_scores.ts`

2. api项目，位于/routers目录下,为react项目提供数据服务。
  - tsc （每次修改后需要重新编译)
  - > node .\dist\app.js` 
  - 或配置开发环境自动重新编译：
   a.  npm install --save-dev ts-node-dev typescript
   b.  package.json 
      "scripts": {
        "dev": "ts-node-dev --respawn --transpile-only src/app.ts"
      }
   c. `npm run dev` 

3. 前端项目位于`paintings-website`项目中

## prisma
ORM框架已由Sequelize-ts切换为Prisma
修改`schema.prisma`后，运行`npx prisma generate`更新 `@prisma/client`的类型。
Prisma Error Code: [https://www.prisma.io/docs/orm/reference/error-reference]
## 运行单个文件
1. 根目录下执行命令'tsc',把.ts文件编译成.js文件
2. 运行在dist目录下生成的.js文件
3. dist目录默认与.ts文件在同一文件夹下，可以配置tsconfig.json文件中的outDir参数
4. .vscode/launch.json  program配置项


#Airbnb的JavaScript编程规范：https://github.com/airbnb/javascript

