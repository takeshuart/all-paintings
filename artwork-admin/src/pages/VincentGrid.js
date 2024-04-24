import { useEffect, useState } from 'react';
import { Container, Typography, ThemeProvider, Grid, Card, CardMedia, CardContent } from '@mui/material';

import { createTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import { SearchInput, FilterAccordion } from './VincentFilter';
import { fetchArtData, fetchConfigData } from './ArtworkApi';

import '../ArtTableStyles.css';


export default function ArtTable() {
  const isDesktop = useMediaQuery('(min-width:600px)');

  const pageSize = 21
  const [artworks, setArtWorks] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [hasImage, setHasImage] = useState(true); //default only image artwork
  const [genres, setGenres] = useState([]);
  const [genreSelected, setGenreSelected] = useState('');
  const [periods, setPeriods] = useState([]);
  const [periodSelected, setPeriodSelected] = useState('');
  const [techniques, setTechniques] = useState([]);
  const [techniqueSelected, setTechniqueSelected] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  useEffect(() => {

    fetchData()
    //listening  data change
  }, [page, hasImage, genreSelected, periodSelected, techniqueSelected]);

  async function fetchData() {

    try {
      setIsLoading(true);
      const artData = await fetchArtData(page, pageSize, searchKeyword, hasImage, genreSelected, periodSelected, techniqueSelected);
      setArtWorks(artData.rows);
      setTotalPages(Math.ceil(artData.count / pageSize));
      setTotalResults(artData.count);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const configData = await fetchConfigData();
      setGenres(configData.genres);
      setPeriods(configData.periods);
      setTechniques(configData.techniques);

    } catch (error) {
      console.error('Error fetching art data', error);
    } finally {
      setIsLoading(false); // Set loading state to false after fetching data
    }

  }

  const handleSearch = (value) => {
    fetchData();
    fetchConfigData();
    //reset 
    setHasImage(false);
    setGenreSelected('');
    setPeriodSelected('');
    setTechniqueSelected('');
  }
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (

    <Container maxWidth="lg" sx={{ mt: 2 }}>

      <Grid container spacing={0}>
        <Grid container sx={{ margin: '30px 1px 30px 10px' }} justifyContent="center">
          <Grid item md={12} >
            <ThemeProvider theme={theme}>

              <Typography align="center" variant="h3">
                Vincent Van Gogh
              </Typography>
            </ThemeProvider>
          </Grid>
        </Grid>

        {/* -----search input------ */}
        <Grid container sx={{ margin: '10px 1px 20px 10px' }}>
          <SearchInput
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            onKeyDown={handleKeyDown}
            onSearch={handleSearch}
          />
        </Grid>
        <Grid container >
          <FilterAccordion
            genreSelected={genreSelected}
            periodSelected={periodSelected}
            techniqueSelected={techniqueSelected}
            hasImage={hasImage}
            handleGenreChange={(event) => setGenreSelected(event.target.value)}
            handlePeriodChange={(event) => setPeriodSelected(event.target.value)}
            handleTechniqueChange={(event) => setTechniqueSelected(event.target.value)}
            handleHasImageChange={(event) => setHasImage(event.target.checked)}
            genresCond={genres}
            periodCond={periods}
            techniqueCond={techniques}
          />
        </Grid>
        {/* ------line 3 ------- */}
        <Grid container xs={12} sm={6} md={12} justifyContent="center" sx={{ marginBottom: '20px', marginTop: '20px' }}>
          <Typography variant="subtitle1" sx={{ color: 'grey' }}>
            发现 <span style={{ fontWeight: 'bold' }}>{totalResults}</span> 个作品
          </Typography>
        </Grid>

        {/* ----- artwork gird ------- */}
        {isLoading ? ( // Show loading indicator if data is being fetched
          <Grid container justifyContent="center" sx={{ mt: 4 }}>
            <Typography>数据加载中...</Typography>
          </Grid>
        ) : (artworks.map((artwork, index) => (
          <Grid item xs={6} sm={6} md={4} key={index}
            sx={{
              padding: '10px 40px 10px 10px',
              '@media (max-width: 600px)': {
                padding: '0px 10px 10px 10px'
              }
            }}>
              <Link to  ={`/vincent/id/${artwork.id}`} target="_blank" style={{ textDecoration: 'none' }}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 'none' }}>
              <CardMedia
                component="img"
                image={`https://www.pubhist.com${artwork.primaryImageSmall}`}
                alt=""
                sx={{
                  height: '250px', width: '100%', objectFit: 'contain', objectPosition: 'center',
                  '@media (max-width: 600px)': {
                    height: '150px'
                  },

                  // backgroundColor: '#fafafa'
                }}
              />
              <CardContent align="left">
                  <Typography sx={{ fontWeight: 'bold', fontSize: { xs: 12, md: 16 } }}>
                    {artwork.titleZh || artwork.titleEn}
                  </Typography>
                {isDesktop && <Typography sx={{ fontStyle: 'italic' }} >{artwork.collection}</Typography>}
                <Typography sx={{ fontSize: { xs: 14, md: 16 }, fontStyle: 'italic' }} >{artwork.placeOfOrigin}</Typography>
              </CardContent>
            </Card>
                </Link> 
          </Grid>
        ))
        )};
        {/* image box end */}

        <Grid item xs={12} sx={{ pb: 8 }}>
          <Grid container justifyContent="center" >
            <Pagination count={totalPages} page={page}
              onChange={(event, value) => setPage(value)}
              color="secondary"
              siblingCount={isDesktop ? 2 : 0}
              size="large" />
          </Grid>
        </Grid>
      </Grid>

    </Container>

  );
}


const theme = createTheme({
  typography: {
    h3: {
      '@media (max-width: 600px)': {
        fontSize: '1.5rem', // Adjust font size for smaller screens
      },
    },
  },
});