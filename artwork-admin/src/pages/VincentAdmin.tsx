
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Container, Drawer, Toolbar, Typography, TextField, Paper, List, ListItem, ListItemIcon, ListItemButton, ListItemText } from '@mui/material';
import { MenuItem, Checkbox, FormControl, InputLabel, OutlinedInput } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridColDef, GridCellParams } from '@mui/x-data-grid';
import TableRowsIcon from '@mui/icons-material/TableRows';
import '../ArtTableStyles.css';

const columns: GridColDef[] = [
  {
    field: 'primaryImageSmall', headerName: 'Image', width: 100,
    renderCell: (params: GridCellParams) => {
      return params.value ? (
        <img
          src={`https://www.pubhist.com${params.value as string}`}
          style={{ width: 80, height: 80, objectFit: 'cover' }}
          alt=""
        />
      ) : '';
    },
  },
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'titleEn', headerName: 'Title', width: 250, editable: true },
  { field: 'genre', headerName: 'Genre', width: 200, editable: true },
  { field: 'fCode', headerName: 'F Number', width: 200 },
  { field: 'jhCode', headerName: 'JH Number', width: 150 },
  { field: 'collection', headerName: 'Collection', width: 200 },
  { field: 'period', headerName: 'Period', width: 200 },
  { field: 'dimension', headerName: 'Dimension', width: 150 },
  { field: 'inventoryCode', headerName: 'Inventory No', width: 150 }

];


const drawerWidth = 240;
const apiDomain = 'http://localhost:5001/artworks/vincent'
export default function ArtTable() {

  const [artworks, setArtWorks] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20, });
  const [genreSelected, setSelectedItems] = useState<string[]>([]);
  const [genresCond, setGenresCond] = useState<any[]>([]);
  const [periodsCond, setPeriodsCond] = useState<any[]>([]);

  useEffect(() => {
    const fetchArtData = async () => {
      try {
        const response = await axios.get(apiDomain, {
          params: {
            page: paginationModel.page + 1, // API 可能期望的页码从1开始
            pageSize: paginationModel.pageSize,
            genres: genreSelected,
          }
        });

        setArtWorks(response.data.rows);
        setTotalRows(response.data.count);
      } catch (error) {
        console.error('Error fetching art data', error);
      }
    };
    fetchArtData();

    // Fetch config data only once when the component mounts
    const fetchConfigData = async () => {
      try {
        const [genreRes, periodRes] = await Promise.all([
          axios.get(apiDomain + '/config?cond=genre'),
          axios.get(apiDomain + '/config?cond=period')
        ]);
        setGenresCond(genreRes.data);
        setPeriodsCond(periodRes.data);
      } catch (error) {
        console.log('Error fetching config data', error);
      }
    };

    fetchConfigData();

  }, [paginationModel, genreSelected]); // 当 currentPage 或 pageSize 变化时重新触发

  const handleChange = (event: SelectChangeEvent<typeof genreSelected>) => {
    const value = event.target.value as string[];
    setSelectedItems(value);
  };
  return (

    <Box sx={{ display: 'flex' }}>
      {/* 左侧导航栏 */}
      <Drawer variant="permanent" sx={{
        width: drawerWidth,
        '& .MuiDrawer-paper': { width: drawerWidth },
      }} >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem>
              <ListItemButton>
                <ListItemIcon>
                  <TableRowsIcon />
                </ListItemIcon>
                <ListItemText primary="ArtWork Table" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      {/*减去侧边栏的宽度 */}
      <Box sx={{ flexGrow: 1, width: `calc(100% - ${drawerWidth}px)` }}>
        <Container maxWidth={false}>
          {/* <Toolbar />  */}
          <Typography variant="h6" marginBottom={2}>ArtWorks Database</Typography>

          <FormControl fullWidth variant="filled">
            <InputLabel id="mutiple-checkbox-label">Items</InputLabel>
            <Select
              labelId="mutiple-checkbox-label"
              id="mutiple-checkbox"
              multiple
              value={genreSelected}
              onChange={handleChange}
              input={<OutlinedInput label="Items" />}
              renderValue={(selected) => selected.join(', ')}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  }
                }
              }}
            >
              {genresCond.map((item) => (
                <MenuItem key={item.genre} value={item.genre}>
                  <Checkbox checked={genreSelected.indexOf(item.value) > -1} />
                  <ListItemText primary={item.genre} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="mutiple-checkbox-label">Items</InputLabel>
            <Select
              labelId="mutiple-checkbox-label"
              id="mutiple-checkbox"
              multiple
              value={genreSelected}
              onChange={handleChange}
              input={<OutlinedInput label="Items" />}
              renderValue={(selected) => selected.join(', ')}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  }
                }
              }}
            >
              {periodsCond.map((item) => (
                <MenuItem key={item.period} value={item.period}>
                  <Checkbox checked={genreSelected.indexOf(item.period) > -1} />
                  <ListItemText primary={item.period} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Search" sx={{ mb: 2 }} />
          <Paper sx={{ height: 850, mb: 3 }}>
            <DataGrid rowHeight={100}
              rows={artworks}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[10, 20, 30]}
              rowCount={totalRows}
              paginationMode="server"
              loading={!artworks.length}
            />
          </Paper>
        </Container>
      </Box>

    </Box>
  );
}

