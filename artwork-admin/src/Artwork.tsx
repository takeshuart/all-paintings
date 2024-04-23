
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Container, Drawer, Toolbar, Typography, TextField, Paper, List, ListItem, ListItemIcon, ListItemButton, ListItemText } from '@mui/material';
import { MenuItem, Checkbox, FormControl, InputLabel, OutlinedInput } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridColDef, GridCellParams } from '@mui/x-data-grid';
import TableRowsIcon from '@mui/icons-material/TableRows';
import './ArtTableStyles.css';

const columns: GridColDef[] = [
  {
    field: 'primary_image_small', headerName: 'Image', width: 100,
    renderCell: (params: GridCellParams) => (params.value ? <img src={params.value as string} alt={params.row.title as string} style={{ width: 80, height: 80, objectFit: 'cover' }} /> : ''
    ),
  },
  { field: 'id', headerName: 'ID', width: 50 },
  { field: 'title', headerName: 'Title', width: 250, editable: true },
  { field: 'artist', headerName: 'Artist', width: 200, editable: true },
  { field: 'art_movement', headerName: 'Movement', width: 200 },
  { field: 'artwork_date', headerName: 'Date', width: 150 },
  { field: 'artwork_type', headerName: 'Type', width: 150 },
  { field: 'museum', headerName: 'Museum', width: 200 },
  { field: 'dimension', headerName: 'Dimension', width: 150 },
  { field: 'museum_location', headerName: 'Location', width: 150 },
  { field: 'inventory_number', headerName: 'Inventory Number', width: 150 },
  { field: 'description', headerName: 'Description', width: 250 },
  { field: 'short_desc', headerName: 'Short Description', width: 250 },
  { field: 'is_highlight', headerName: 'Highlight', width: 120, type: 'boolean' },
  { field: 'genre', headerName: 'Genre', width: 150 },
  { field: 'subject', headerName: 'Subject', width: 150 },
  { field: 'depicts', headerName: 'Depicts', width: 150 },
  { field: 'image_wikimedia_url', headerName: 'Image Detail URL', width: 150 },
  { field: 'primary_image_large', headerName: 'Large Image', width: 150 },
  { field: 'primary_image_original', headerName: 'Image Original', width: 150 },
  { field: 'cat_no', headerName: 'Catalog Number', width: 150 },
];
// Options for the dropdown
interface Item {
  name: string;
  value: string;
}
const artMoveOptions: Item[] = [
  { name: '现实主义', value: 'Realism' },
  { name: '印象派', value: 'Impressionism' },
  { name: '现代主义', value: 'Modernism' },
  { name: '19世纪', value: '19th century' },
  { name: '立体主义', value: 'Cubism' },
  { name: '野兽派', value: 'Fauvism' },
];

const drawerWidth = 240;

export default function ArtTable() {

  const [artworks, setArtWorks] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20, });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchArtData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/artworks', {
          params: {
            page: paginationModel.page + 1, // API 可能期望的页码从1开始
            pageSize: paginationModel.pageSize,
            artMovements: selectedItems,
          }
        });
        setArtWorks(response.data.data);
        setTotalRows(response.data.total.total);
      } catch (error) {
        console.error('Error fetching art data', error);
      }
    };
    fetchArtData();
  }, [paginationModel, selectedItems]); // 当 currentPage 或 pageSize 变化时重新触发

  const handleChange = (event: SelectChangeEvent<typeof selectedItems>) => {
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

          <FormControl fullWidth>
            <InputLabel id="mutiple-checkbox-label">Items</InputLabel>
            <Select
              labelId="mutiple-checkbox-label"
              id="mutiple-checkbox"
              multiple
              value={selectedItems}
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
              {artMoveOptions.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  <Checkbox checked={selectedItems.indexOf(item.value) > -1} />
                  <ListItemText primary={item.name} />
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

