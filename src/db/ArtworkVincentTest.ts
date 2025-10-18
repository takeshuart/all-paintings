import { ArtworkVincentDao, ArtworkVincent } from './ArtworkVincentDAO';

async function main() {
  const dao = new ArtworkVincentDao();

  const artwork: ArtworkVincent = {
    titleEn: "Sunflowers",
    titleZh: "向日葵",
    fCode: "F458",
    jhCode: "JH1569",
    collection: "Van Gogh Museum",
    genre: "Still Life",
    period: "Arles",
    displayDate: "1888",
    isHighlight: 1,
    shortDesc: "One of Van Gogh's most iconic works.",
    description: "Oil on canvas painting of sunflowers in a vase.",
    primaryImageLarge: "https://example.com/sunflowers_large.jpg",
    dataSource: "manual_import"
  };

  //   const id = dao.insert(artwork);
  //   console.log("Inserted artwork id:", id);

  // const affectedRows = dao.update(11040, {
  //   titleEn: 'The Potato Eaters (Updated)',
  //   isHighlight: 1,
  //   primaryImageSmall:"/23/23/23.jpg",
  //   description: 'Updated description for testing.'
  // });

  // const affectedRows=dao.updateByJhCodeOrFCode({jhCode:"JH1569",fCode:""},{genre:"Still Life(Update3)"})
  // console.log(`affectedRows: ${affectedRows}`);
  const at = dao.findByVgCode("", "F1724v")
  console.log(at)
}

main();
