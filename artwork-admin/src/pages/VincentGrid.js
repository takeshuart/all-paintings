import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, FormGroup, FormControlLabel, TextField, Checkbox, Grid, Card, CardMedia, CardContent, FormControl, InputLabel, Select, FilledInput, MenuItem } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import '../ArtTableStyles.css';

const apiDomain = 'http://localhost:5001/artworks/vincent';

export default function ArtTable() {
  const pageSize = 21
  const [artworks, setArtWorks] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [hasImage, setHasImage] = useState(false);
  const [genresCond, setGenresCond] = useState([]);
  const [genreSelected, setGenreItems] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');


  useEffect(() => {

    fetchArtData();
    fetchConfigData();

  }, [page, hasImage, genreSelected]); //listening  data change

  async function fetchArtData() {
    try {
      const response = await axios.get(apiDomain, {
        params: {
          page: page,
          pageSize: pageSize,
          search:searchKeyword,
          hasImage: hasImage,
          genres: genreSelected ? [genreSelected] : []
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
      const [genreRes] = await Promise.all([
        axios.get(apiDomain + '/config?cond=genre'),
      ]);
      setGenresCond(genreRes.data);
    } catch (error) {
      console.log('Error fetching config data', error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      fetchArtData();
      fetchConfigData();
      //reset 
      setHasImage(false);
      setGenreItems('');
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
  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  return (

    <Container maxWidth="lg" sx={{ mt: 2 }}>

      <Grid container spacing={0}>
        <Grid container sx={{ margin: '30px 1px 30px 10px' }}>
          <Grid item md={12} >
            <Typography variant="h2" align="center" >
              Vincent Van Gogh
            </Typography>
          </Grid>
        </Grid>
        <Grid container sx={{ margin: '10px 1px 30px 10px' }}>
          <TextField variant="filled" size='medium' fullWidth label="作品/博物馆关键词，支持中/英"
            value={searchKeyword}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown} //Enter key
          />
        </Grid>
        <Grid container sx={{ margin: '30px 1px 30px 10px' }}>
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
          <Grid item xs={12} sm={6} md={3}>

            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={hasImage} onChange={handleHasImageChange} />}
                label="有图片"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>

            <Typography variant="subtitle1" >
              发现 <span style={{ fontWeight: 'bold' }}>{totalResults}</span> 个作品
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>

          </Grid>
        </Grid>
        {artworks.map((artwork, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} sx={{ padding: '20px 30px 10px 20px' }}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 'none' }}>
              <CardMedia
                component="img"
                image={`https://www.pubhist.com${artwork.primaryImageSmall}`}
                alt=""
                sx={{ height: '300px', width: '100%', objectFit: 'contain', objectPosition: 'bottom', backgroundColor: '#fafafa' }}
              />
              <CardContent>
                <Typography variant="subtitle1" align="left" sx={{ fontWeight: 'bold', fontSize: 18 }}>
                  {artwork.titleZh}
                </Typography>
                <Typography variant="subtitle1" align="left" >
                  {artwork.collection}
                </Typography>
                <Typography variant="subtitle1" align="left" >
                  {artwork.placeOfOrigin}
                </Typography>
                <Typography variant="subtitle1" align="left" >
                  {artwork.displayDate}
                </Typography>
                <Typography variant="subtitle1" align="left" >
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
