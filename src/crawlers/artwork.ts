//wikipedia resful api : https://en.wikipedia.org/api/rest_v1/#/
//https://www.mediawiki.org/wiki/API:Main_page
//使用wikipedia的官方api获取数据，不用写负责的html解析，也不容易被封ip


//使用Partial<>要求类的属性都是可选的，即可以是undefined类型??
export class ArtWork {
    inventoryNumber?: string | undefined;//艺术品所在博物馆的编号，全球唯一识别一幅艺术品
    artist: string | undefined;
    title: string | undefined;
    description: string | undefined
    shortDesc: string | undefined;//简短描述
    isHighlight: boolean | undefined;
    artMovement: string | undefined;//流派
    artworkType: string | undefined;//painting/drawing/print etc..
    genre: string | undefined;//门类，风景画、静物画等。
    subject: string | undefined;//绘画核心主题，特定任务、事件、爱情、战争等
    depicts: string | undefined;//描绘内容，水果,女人，孩子等
    placeOfOrigin: string | undefined;//产地/创作地
    artwork_wikipedia_url: string | undefined;
    artwork_museum_url: string | undefined;
    image_wikimedia_url: string | undefined;

    primaryImageSmall: string | undefined;//博物馆标准为843px宽
    primaryImageMedium: string | undefined;
    primaryImageLarge: string | undefined;
    primaryImageOriginal: string | undefined;
    artworkDate: string | undefined; //inception 作品创作时间
    museumLocation: string | undefined;
    museum: string | undefined;//应该改为collection,收藏机构，是博物馆、画廊、私人收藏的总称
    dimension: string | undefined;
    catNo: string | undefined;
    color: string | undefined;
    dataSource: string | undefined;//数据来源

    constructor(data?: {
        inventoryNumber?: string,
        artist?: string,
        title?: string,
        description?: string,
        shortDesc?: string,
        isHighlight?: boolean,
        artMovement?: string,
        artworkType?:string,
        genre?: string,
        subject?: string,
        depicts?: string,
        placeOfOrigin?: string
        imageDetailUrl?: string,
        imageSmall?: string,
        imageLarge?: string,
        imageOriginal?: string,
        date?: string,
        location?: string,
        museum?: string, 
        dimension?: string,
        catNo?: string
    }) {
        this.inventoryNumber = data?.inventoryNumber;
        this.artist = data?.artist;
        this.title = data?.title;
        this.artworkType=data?.artworkType;
        this.description = data?.description;
        this.shortDesc = data?.shortDesc;
        this.isHighlight = data?.isHighlight ?? false;
        this.artMovement = data?.artMovement;
        this.placeOfOrigin = data?.placeOfOrigin;
        this.genre = data?.genre;
        this.subject = data?.subject;
        this.depicts = data?.depicts;
        this.image_wikimedia_url = data?.imageDetailUrl;
        this.primaryImageSmall = data?.imageSmall;
        this.primaryImageLarge = data?.imageLarge;
        this.primaryImageOriginal = data?.imageOriginal;
        this.artworkDate = data?.date;
        this.museumLocation = data?.location;
        this.museum = data?.museum;
        this.dimension = data?.dimension;
        this.catNo = data?.catNo;
    }
}


// 使用as typeof类型断言，因为ts无法保证运行时的 key一定是ArtWork的属性
// 即使config是ArtWorkProperties的类型
export function createArtWorkFromWikiTable(element: any[], config: ArtWorkProperties): ArtWork {
    let artWork: Partial<ArtWork> = {};

    Object.keys(config).forEach((key) => {
        const value = config[key as keyof ArtWorkProperties];
        if (typeof value === 'function') {
            artWork[key as keyof ArtWork] = value(element);
        } else if (typeof value === 'number') {//table-td index
            artWork[key as keyof ArtWork] = element[value];
        } else { //其他类型直接赋值
            artWork[key as keyof ArtWork] = value;
        }
    });

    return artWork as ArtWork;
}

//wikitable映射文件
//const mappingConfig: ArtWorkProperties = {
//    artist: 3, //key为ArtWork的属性，value为wikitable对于的列索引
//    title: 1,
//    imageUrl: (element: any) => element[0].src
//    ....
//};
export type ArtWorkProperties = {
    [key in keyof ArtWork]?: any; //与ArtWork属性形同且可选，但是类型为any
};

export class Museum {
    name: string;
    location: string;

    constructor(name: string, location: string) {
        this.name = name;
        this.location = location;
    }
}