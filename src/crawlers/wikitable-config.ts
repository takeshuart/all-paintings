import { ArtWorkProperties, Museum } from "./artwork";
export const GettyMuseumConfig: ArtWorkProperties = {
    artist: 3,
    title: 0,
    image_wikimedia_url: (e: any[]) => e[2].href,
    primaryImageSmall: (e: any[]) => e[2].src,
    museumLocation: 'Washington, U.S.',
    museum: 5,
    catNo: 4,
}

//The Most Famous Paintings of the World
export const TheMostFamousPaintingsConfig: ArtWorkProperties = {
    artist: 4,
    title: 1,
    isHighlight: true,
    image_wikimedia_url: (e: any[]) => e[0].href,
    primaryImageSmall: (e: any[]) => e[0].src,
    artworkDate: 5,
    museum: 6,
    inventoryNumber: 7,
}

const BaseWikidataAllPaintingsPageConfig: ArtWorkProperties = {
    artist: 3,
    title: 1,
    isHighlight: false,
    inventoryNumber: 5,
    genre: 6,
    subject: 7,
    depicts: 8,
    image_wikimedia_url: (e: any[]) => e[0].href,
    primaryImageSmall: (e: any[]) => e[0].src,
    artworkDate: 4,
    museumLocation: 'Vienna, Austria',
    museum: "Kunsthistorisches Museum",
    dimension: '',
}

//The New Complete Van Gogh
export const VanGoghNewListConfig: ArtWorkProperties = {
    artist: "Vincent van Gogh",
    title: 1,
    isHighlight: true,
    catlog:3,
    image_wikimedia_url: (e: any[]) => e[0].href,
    primaryImageSmall: (e: any[]) => e[0].src,
    artworkDate: 5,
    
    museum: 6,
    inventoryNumber: 7,
}
export class WikiPageWithTable {
    title: string;//html title
    config: ArtWorkProperties;
    url: string;
    museum?: Museum | null;
    constructor(name: string, config: ArtWorkProperties, museum: Museum | null, url: string) {
        this.title = name;
        this.config = config;
        this.url = url;
        this.museum = museum;
    }
}
const wikiDataDomain = 'https://www.wikidata.org/wiki'
const kunsthistorischesMuseum = new Museum("Kunsthistorisches Museum", "Vienna, Austria");
const nationGalleryUk = new Museum("The National Gallery,London", " London, UK");
const vanGoghMusuem='https://www.wikidata.org/wiki/Wikidata:WikiProject_sum_of_all_paintings/Collection/Van_Gogh_Museum'
export const wikiPageList = {
    // nationGalleryUkMuseum: new WikiPageWithTable('', nationGalleryUkMuseumConfig,undefined, wikiDataDomain + '/Wikidata:WikiProject_sum_of_all_paintings/Collection/National_Gallery'),
    // GettyMuseum: new WikiPageWithTable('', GettyMuseumConfig,undefined, wikiDataDomain + '/Wikidata:WikiProject_sum_of_all_paintings/Collection/J._Paul_Getty_Museum'),
    // KunsthistorischesMuseum:new WikiPageWithTable('',BaseWikidataAllPaintingsPageConfig,kunsthistorischesMuseum,wikiDataDomain+'/Wikidata:WikiProject_sum_of_all_paintings/Collection/Kunsthistorisches_Museum')
    // TheMostFamousPaintings: new WikiPageWithTable('', TheMostFamousPaintingsConfig, null, wikiDataDomain + '/Wikidata:WikiProject_sum_of_all_paintings/Catalog/The_Most_Famous_Paintings_of_the_World')
    VanGoghNewList: new WikiPageWithTable('', VanGoghNewListConfig, null, wikiDataDomain + '/Wikidata:WikiProject_sum_of_all_paintings/Catalog/The_New_Complete_Van_Gogh')

}


