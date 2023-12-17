## 运行项目
1. 根目录下执行命令'tsc',把.ts文件编译成.js文件
2. 运行在dist目录下生成的.js文件
3. dist目录默认与.ts文件在同一文件夹下，可以配置ts.config.json文件中的outDir参数


#
目录结构
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
10.荷兰国立博物馆绘画藏品列表 https://query.wikidata.org/#SELECT%20DISTINCT%20%3Fitem%20%3Finceptionyear%20%3Frkdurl%20WHERE%20%7B%20%0A%20%20wd%3AP350%20wdt%3AP1630%20%3Fformatterurl%20.%0A%20%20%3Fitem%20wdt%3AP195%20wd%3AQ190804%20.%0A%20%20%3Fitem%20wdt%3AP31%20wd%3AQ3305213%20.%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP571%20%3Finception%20.%20BIND%28year%28%3Finception%29%20as%20%3Finceptionyear%29%20%7D%0A%20%20OPTIONAL%20%7B%20%0A%20%20%20%20MINUS%20%7B%20%3Fitem%20wdt%3AP571%20%5B%5D%20%7D%20%0A%20%20%20%20%3Fitem%20wdt%3AP170%20%3Fcreator%20.%0A%20%20%20%20%3Fcreator%20wdt%3AP569%20%3Fdob%20.%20%3Fcreator%20wdt%3AP570%20%3Fdod%20.%0A%20%20%20%20BIND%28%28%28year%28%3Fdod%29%20-%20year%28%3Fdob%29%29%2F2%20%2B%20year%28%3Fdob%29%29%20as%20%3Finceptionyear%29%20%0A%20%20%7D%0A%20%20OPTIONAL%20%7B%20%0A%20%20%20%20MINUS%20%7B%20%3Fitem%20wdt%3AP571%20%5B%5D%20%7D%20%0A%20%20%20%20%3Fitem%20wdt%3AP170%20%3Fcreator%20.%0A%20%20%20%20MINUS%20%7B%20%3Fcreator%20wdt%3AP570%20%5B%5D%20%7D%0A%20%20%20%20%3Fcreator%20wdt%3AP569%20%3Fdob%20.%0A%20%20%20%20BIND%28%28year%28%3Fdob%29%20%2B%2050%29%20as%20%3Finceptionyear%29%20%0A%20%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fitem%20wdt%3AP350%20%3Frkdid%20%7D%0A%20%20BIND%28REPLACE%28%3Frkdid%2C%20%27%5E%28%5C%5Cd%2B%29%24%27%2C%20CONCAT%28%22%5B%22%2C%20%3Fformatterurl%2C%20%22%20%241%5D%22%29%29%20AS%20%3Frkdurl%29%0A%7D%20LIMIT%2010000%0A
