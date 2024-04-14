## 运行项目
1. 根目录下执行命令'tsc',把.ts文件编译成.js文件
2. 运行在dist目录下生成的.js文件
3. dist目录默认与.ts文件在同一文件夹下，可以配置tsconfig.json文件中的outDir参数
4. .vscode/launch.json  program配置项

## artwork-admin项目
1. 先启动admin-api 
   `artwork-database> node .\dist\app.js ## start node project`
2. 启动artwork-admin项目
   `art-admin> npm start # start react project `
   - 先编译tsc 

## 运行artwork-database项目
- 环境配置 
  该项目为node.js+typescript项目，通过vscode直接运行.ts文件需要配置`launch.json`文件
1. `run->start debugging`， 运行的文件配置在`tsconfig.json#outDir`


# 目录结构
crawler-project/
│
├── node_modules/          # 包含所有 npm 依赖项
│
├── src/                   # 源代码目录
│   ├── crawlers/          # 爬虫脚本或模块
│   ├── utils/             # 工具函数，如数据解析、格式化
│   └── index.js           # 爬虫服务的主要入口文件
│   ├── controllers/       # 控制器，用于处理请求和返回响应
│   ├── models/             # 数据模型，用于与数据库交互
│   ├── routes/           # 路由，定义 URL 到控制器的映射
│   ├── views/            # 视图文件，如 EJS 或 Pug 模板
│   └── app.js            # 应用的主入口文件
│
├── data/                  # 存储爬取的数据文件（如 JSON、CSV）
│
├── logs/                  # 日志文件目录
├── test/               # 测试代码和资源
├── public/             # 静态文件，如样式表、JavaScript、图片等
│
├── package.json           # 项目的依赖配置文件
│
├── package-lock.json      # 确保依赖的一致安装
│
└── .env                   # 环境变量文件

#Airbnb的JavaScript编程规范：https://github.com/airbnb/javascript


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
