import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, FormGroup, FormControlLabel, TextField, Checkbox, Grid, Card, CardMedia, CardContent, FormControl, InputLabel, IconButton, InputAdornment, Select, FilledInput, MenuItem } from '@mui/material';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Pagination from '@mui/material/Pagination';
import SearchIcon from '@mui/icons-material/Search';
import '../ArtTableStyles.css';

const apiDomain = 'http://192.168.50.156:5001/artworks/vincent';

export default function ArtTable() {
  const pageSize = 21
  const [artworks, setArtWorks] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [hasImage, setHasImage] = useState(false);
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

  }, [page, hasImage, genreSelected, periodSelected,techniqueSelected]); //listening  data change

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
      const [genreRes, periodRes,techniques] = await Promise.all([
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
        <Grid container sx={{ margin: '30px 1px 30px 10px' }}>
          <Grid item md={12} >
            <Typography align="center" variant="h3"
              sx={{
                '@media (max-width: 600px)': {
                  variant: 'h6',
                },
              }}
            >
              Vincent Van Gogh
            </Typography>
          </Grid>
        </Grid>

        {/* -----search input------ */}
        <Grid container sx={{ margin: '10px 1px 20px 10px' }}>
          <TextField variant="standard" size='medium' fullWidth label="作品/博物馆关键词，支持中/英"
            value={searchKeyword}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown} //Enter key
            InputProps={{
              endAdornment: ( //startAdornment icon 在前面
                <InputAdornment >
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* -----line 2 search------ */}
        <Grid container sx={{ marginTop: '10px', marginBottom: '40px' }}>

          <Grid item xs={12} sm={6} md={3} sx={{ marginRight: '20px' }}>
            {/* fullWidth size='small' */}
            <FormControl fullWidth variant="filled" size='small' sx={{ mt: 1 }}>
              <InputLabel id="genre-checkbox-label">主题</InputLabel>
              <Select
                labelId="genre-checkbox-label"
                id="genre-checkbox"
                value={genreSelected}
                onChange={handleGenreChange}
                input={<FilledInput />}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    }
                  }
                }}
              >
                <MenuItem value="">所有主题</MenuItem>

                {genresCond.map((item) => (
                  <MenuItem key={item.genre} value={item.genre}>
                    {item.genre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ marginRight: '20px' }}>
            {/* fullWidth size='small' */}
            <FormControl fullWidth variant="filled" size='small' sx={{ mt: 1 }}>
              <InputLabel id="period-checkbox-label">时期</InputLabel>
              <Select
                labelId="period-checkbox-label"
                id="period-checkbox"
                value={periodSelected}
                onChange={handlePeriodChange}
                input={<FilledInput />}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    }
                  }
                }}
              >
                <MenuItem value="">所有时期</MenuItem>

                {periodCond.map((item) => (
                  <MenuItem key={item.period} value={item.period}>
                    {item.period}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2} sx={{ marginRight: '20px' }}>
            {/* fullWidth size='small' */}
            <FormControl fullWidth variant="filled" size='small' sx={{ mt: 1 }}>
              <InputLabel id="technique-checkbox-label">技法类型</InputLabel>
              <Select
                labelId="technique-checkbox-label"
                id="technique-checkbox"
                value={techniqueSelected}
                onChange={handleTechniqueChange}
                input={<FilledInput />}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    }
                  }
                }}
              >
                <MenuItem value="">所有类型</MenuItem>

                {techniqueCond.map((item) => (
                  <MenuItem key={item.technique} value={item.technique}>
                    {item.technique}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid container xs={12} sm={6} md={2} justifyContent="center" alignItems="center">

            <FormGroup >
              <FormControlLabel
                control={<Checkbox checked={hasImage} onChange={handleHasImageChange} />}
                label="有图片"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
          </Grid>
        </Grid>
        {/* ------line 3 ------- */}
        <Grid container xs={12} sm={6} md={12} justifyContent="center" sx={{ marginBottom: '20px' }}>
          <Typography variant="subtitle1" sx={{ color: 'grey' }}>
            发现 <span style={{ fontWeight: 'bold' }}>{totalResults}</span> 个作品
          </Typography>
        </Grid>

        {/* ----- artwork gird ------- */}
        {artworks.map((artwork, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}
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
                    objectPosition: 'center',
                    height: '200px'
                  },
                  objectPosition: 'center',
                  backgroundColor: '#fafafa'
                }}
              />
              <CardContent variant="subtitle1" align="left"
                sx={{
                  '@media (max-width: 600px)': {
                    fontSize: 14
                  }
                }}
              >
                <Typography sx={{ fontWeight: 'bold', fontSize: 18 }}>
                  {artwork.titleZh}
                </Typography>
                <Typography >
                  {artwork.collection}
                </Typography>
                <Typography  >
                  {artwork.placeOfOrigin}
                </Typography>
                <Typography  >
                  {artwork.displayDate}
                </Typography>
                <Typography >
                  {artwork.dimension}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sx={{ pb: 8 }}>
          <Grid container justifyContent="center" >
            <Pagination count={totalPages} page={page} onChange={handlePageChange} shape="rounded" size="large" />
          </Grid>
        </Grid>
      </Grid>

    </Container>

  );
}
