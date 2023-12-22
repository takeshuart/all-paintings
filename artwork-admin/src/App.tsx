import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import Pagination from '@mui/material/Pagination';
import Tooltip from '@mui/material/Tooltip';
import './ArtTableStyles.css';
import Typography from '@mui/material/Typography';



// Define the interface for your API data
interface ArtWork {
  id: string;
  inventory_number?: string;
  artist: string;
  title: string;
  short_desc: string;
  is_highlight: boolean;
  genre: string;
  subject: string;
  depicts: string;
  image_detail_url: string;
  image_url: string;
  image_thumbnail: string;
  image_large: string;
  image_original: string;
  time: string;
  year: string;
  location: string;
  museum: string;
  dimension: string;
  cat_no: string;
}

// Define the columns based on the ArtPiece structure
const columns: { label: string; dataKey: keyof ArtWork; numeric?: boolean; width: number; }[] = [
  { label: 'Image URL', dataKey: 'image_url', width: 100 },
  { label: 'ID', dataKey: 'id', width: 30 },
  { label: 'Title', dataKey: 'title', width: 200 },
  { label: 'Artist', dataKey: 'artist', width: 200 },
  { label: 'Year', dataKey: 'year', width: 100 },
  { label: 'Museum', dataKey: 'museum', width: 200 },
  { label: 'Dimension', dataKey: 'dimension', width: 200 },
  { label: 'Location', dataKey: 'location', width: 100 },
  { label: 'Inventory Number', dataKey: 'inventory_number', width: 100 },
  { label: 'Short Description', dataKey: 'short_desc', width: 250 },
  { label: 'Highlight', dataKey: 'is_highlight', width: 50 },
  { label: 'Genre', dataKey: 'genre', width: 100 },
  { label: 'Subject', dataKey: 'subject', width: 100 },
  { label: 'Depicts', dataKey: 'depicts', width: 100 },
  { label: 'Image Detail URL', dataKey: 'image_detail_url', width: 100 },
  { label: 'Image Thumbnail', dataKey: 'image_thumbnail', width: 100 },
  { label: 'Image Large', dataKey: 'image_large', width: 100 },
  { label: 'Image Original', dataKey: 'image_original', width: 100 },
  { label: 'Time', dataKey: 'time', width: 100 },
  { label: 'Catalog Number', dataKey: 'cat_no', width: 100 },
];

const VirtuosoTableComponents: TableComponents<ArtWork> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
  ),
  TableHead,
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric || false ? 'right' : 'left'}
          style={{ width: column.width }}
          className="tableHeaderCell"
          sx={{
            backgroundColor: 'background.paper',
          }}
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

function rowContent(_index: number, row: ArtWork) {
  const renderCellContent = (dataKey: keyof ArtWork, value: string | boolean | undefined) => {
    // Handle the case when value is undefined
    if (value === undefined) {
      return <div className="cellContent">-</div>; // or any placeholder you prefer
    }

    // Check if the column should display an image
    if (dataKey === 'image_url' || dataKey === 'image_thumbnail') { // Add other image columns if any
      return typeof value === 'string' ? (
        <img src={value} alt="" style={{ maxWidth: '100px', maxHeight: '100px' }} />
      ) : null; // If value is not a string, render nothing
    }

    // Render other types of content
    return (
      <Tooltip title={String(value)} placement="top" classes={{ tooltip: 'customTooltip' }}>
        <div className="cellContent">
          {String(value)}
        </div>
      </Tooltip>
    );
  };

  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          align={column.numeric || false ? 'right' : 'left'}
        >
          {renderCellContent(column.dataKey, row[column.dataKey])}
        </TableCell>
      ))}
    </React.Fragment>
  );
}



interface ApiResponse {
  data: ArtWork[];
  total: Total;
}
interface Total {
  total: number;
}

export default function ArtTable() {
  const [artworks, setArtWorks] = useState<ArtWork[]>([]);
  const [currentPage, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const pageSize = 20;
  useEffect(() => {
    try {
      axios.get<ApiResponse>('http://localhost:5001/artwork/data', {
        params: {
          page: currentPage,
          rowsPerPage: pageSize
        }
      }).then(response => {
        setArtWorks(response.data.data);
        setTotalRows(response.data.total.total);
      })
    } catch (error) {
      console.error('Error fetching art data', error);
    }

  }, [currentPage]);

  const totalPages = Math.ceil(totalRows / pageSize);

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage - 1); // 因为 Pagination 的页码从1开始
  };

  return (
    <div className="pageContainer">
      <Typography variant="h3" className="pageTitle">
        All Collections of Art Work
      </Typography>

      <Paper className="tableContainer">
        <TableVirtuoso
          data={artworks}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
        />
      </Paper>

      <Pagination className='paginationContainer'
        count={totalPages}
        page={currentPage}
        onChange={handleChangePage}
        siblingCount={2}
        boundaryCount={1}
        variant="outlined"
        shape="rounded"
      />
    </div>
  );
}
