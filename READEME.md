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

#Airbnb的JavaScript编程规范：https://github.com/airbnb/javascript

### 图片文件命名规范
- 缩写 
VGM, Van Gogh Museum
GAP, Google Art Project
KMM, Kröller-Müller Museum
wikimedia-VGM, 来自wikimedia，由VGM贡献的图片

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
