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
