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
1. 本地脚本，位于/scripts目录下。
  `.vscode/launch.json`已配置`ts-node ESM`,
  通过vscode `run->start debugging`运行当前打开的`.ts`文件
 -  编译`npm run build`
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
   c. npm run dev  -- start 

3. 前端项目位于`paintings-website`项目中

## 运行单个文件
1. 根目录下执行命令'tsc',把.ts文件编译成.js文件
2. 运行在dist目录下生成的.js文件
3. dist目录默认与.ts文件在同一文件夹下，可以配置tsconfig.json文件中的outDir参数
4. .vscode/launch.json  program配置项


#Airbnb的JavaScript编程规范：https://github.com/airbnb/javascript

### 图片文件命名规范
- 缩写 
VGM, Van Gogh Museum
GAP, Google Art Project
KMM, Kröller-Müller Museum
wikimedia-VGM, 来自wikimedia，由VGM贡献的图片
- version
同一个作品可能会有多个版本的图片，文件名中用_-_v1\v2\v3区别

### 数据源
1. 大都会博物馆开放接口 https://metmuseum.github.io/
 可以直接下载全部艺术品信息48万条 https://github.com/metmuseum/openaccess
2. Wikidata https://www.wikidata.org
3. 台北故宫博物馆开放数据
4. 卢浮宫开放数据，搜索结果可以导出csv文件。 https://collections.louvre.fr/en/recherche?typology%5B0%5D=22&lt=list
5. wikiProject，世界上主要绘画作品整理项目。 https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings
6. 大都会所有的绘画藏品：https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Collection/Metropolitan_Museum_of_Art
7. 绘画主题：https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Top_main_subjects
8. 视觉艺术流派：https://www.wikidata.org/wiki/Wikidata:WikiProject_Visual_arts/Item_structure/Art_genres
9. Getty博物馆所有油画：https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Collection/J._Paul_Getty_Museum
10.荷兰国立博物馆绘画藏品列表 
11.英国国家美术馆：https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Collection/National_Gallery\
12.芝加哥艺术学院博物馆开放数据：https://github.com/art-institute-of-chicago/api-data
   https://api.artic.edu/docs/#introduction
13.The Most Famous Paintings of the World :https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Catalog/The_Most_Famous_Paintings_of_the_World
