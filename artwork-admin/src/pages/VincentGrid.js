import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, FormGroup, FormControlLabel, ThemeProvider, Checkbox, Grid, Card, CardMedia, CardContent } from '@mui/material';

import { createTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { SearchInput, FilterAccordion } from './VincentFilter';

import '../ArtTableStyles.css';

const apiDomain = 'http://192.168.50.156:5001/artworks/vincent';


export default function ArtTable() {
  const isDesktop = useMediaQuery('(min-width:600px)');

  const pageSize = 21
  const [artworks, setArtWorks] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [hasImage, setHasImage] = useState(true); //default only image artwork
  const [genresCond, setGenresCond] = useState([]);
  const [genreSelected, setGenreItems] = useState('');
  const [periodCond, setPeriodsCond] = useState([]);
  const [periodSelected, setPeriodItems] = useState('');
  const [techniqueCond, setTechniquesCond] = useState([]);
  const [techniqueSelected, setTechniqueItems] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {

    fetchArtData();
    fetchConfigData();

    //listening  data change
  }, [page, hasImage, genreSelected, periodSelected, techniqueSelected]);

  async function fetchArtData() {
    try {
      const response = await axios.get(apiDomain, {
        params: {
          page: page,
          pageSize: pageSize,
          search: searchKeyword,
          hasImage: hasImage,
          genres: genreSelected ? [genreSelected] : [],
          periods: periodSelected ? [periodSelected] : [],
          techniques: techniqueSelected ? [techniqueSelected] : []
        }
      });
      setArtWorks(response.data.rows);
      setTotalPages(Math.ceil(response.data.count / pageSize));
      setTotalResults(response.data.count);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching art data', error);
    }
  };

  async function fetchConfigData() {
    try {
      const [genreRes, periodRes, techniques] = await Promise.all([
        axios.get(apiDomain + '/config?cond=genre'),
        axios.get(apiDomain + '/config?cond=period'),
        axios.get(apiDomain + '/config?cond=technique'),

      ]);
      setGenresCond(genreRes.data);
      setPeriodsCond(periodRes.data);
      setTechniquesCond(techniques.data)
    } catch (error) {
      console.log('Error fetching config data', error);
    }
  };
  const handleSearch = (value) => {
    fetchArtData();
    fetchConfigData();
    //reset 
    setHasImage(false);
    setGenreItems('');
    setPeriodItems('');
    setTechniqueItems('');
  }
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleHasImageChange = (event) => {
    console.log('has image checked')
    setHasImage(event.target.checked);
  };

  const handleGenreChange = (event) => {
    const value = event.target.value;
    setGenreItems(value);
  };
  const handlePeriodChange = (event) => {
    const value = event.target.value;
    setPeriodItems(value);
  };
  const handleTechniqueChange = (event) => {
    const value = event.target.value;
    setTechniqueItems(value);
  };
  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

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
            onChange={handleSearchChange}
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
            handleGenreChange={handleGenreChange}
            handlePeriodChange={handlePeriodChange}
            handleTechniqueChange={handleTechniqueChange}
            handleHasImageChange={handleHasImageChange}
            genresCond={genresCond}
            periodCond={periodCond}
            techniqueCond={techniqueCond}
          />
        </Grid>
        {/* ------line 3 ------- */}
        <Grid container xs={12} sm={6} md={12} justifyContent="center" sx={{ marginBottom: '20px',marginTop:'20px' }}>
          <Typography variant="subtitle1" sx={{ color: 'grey' }}>
            发现 <span style={{ fontWeight: 'bold' }}>{totalResults}</span> 个作品
          </Typography>
        </Grid>

        {/* ----- artwork gird ------- */}
        {artworks.map((artwork, index) => (
          <Grid item xs={6} sm={6} md={4} key={index}
            sx={{
              padding: '10px 30px 10px 20px',
              '@media (max-width: 600px)': {
                padding: '0px 10px 10px 10px'
              }
            }}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 'none' }}>
              <CardMedia
                component="img"
                image={`https://www.pubhist.com${artwork.primaryImageSmall}`}
                alt=""
                sx={{
                  height: '300px', width: '100%', objectFit: 'contain',
                  '@media (max-width: 600px)': {
                    height: '150px'
                  },
                  objectPosition: 'center',
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
          </Grid>
        ))}
        <Grid item xs={12} sx={{ pb: 8 }}>
          <Grid container justifyContent="center" >
            <Pagination count={totalPages} page={page} onChange={handlePageChange}
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