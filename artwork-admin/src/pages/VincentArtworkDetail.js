import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchArtworkById } from './ArtworkApi';
import { CardMedia, Dialog, DialogContent, DialogTitle, Divider, Grid, Link, Typography, useMediaQuery } from '@mui/material';

const ArtworkDetailPage = () => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const { id } = useParams();
    const [artwork, setArtwork] = useState(null);
    const [extLinks, setExtLinks] = useState('');
    const [exhibitions, setExhibition] = useState('');
    const [open, setOpen] = useState(false);


    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                const artworkData = await fetchArtworkById(id);
                setArtwork(artworkData);
                if (artworkData.extLinks) {
                    setExtLinks(JSON.parse(artworkData.extLinks))
                }
                if (artworkData.exhibitions) {
                    setExhibition(JSON.parse(artworkData.exhibitions));
                }
            } catch (error) {
                console.error('Error fetching artwork data', error);
            }
        };

        fetchArtwork();
    }, []);

    if (!artwork) {
        return <div>Loading...</div>;
    }

    const handleClose = () => {
        setOpen(false);
      };

    return (
        <Grid container justifyContent="center">
            <Grid item md={11} align='left' sx={{ marginTop: '30px' }}>
                <Typography variant='h5'
                    style={{ letterSpacing: '2px' }}
                > 梵·高档案馆 </Typography>
            </Grid>

            <Grid item md={12} sx={{ marginTop: '50px', marginBottom: '30px' }}>
                <CardMedia
                    component="img"
                    image={`https://www.pubhist.com${artwork.primaryImageSmall}`}
                    alt=""
                    sx={{
                        height: '500px', width: '100%', objectFit: 'contain', objectPosition: 'center',
                        '@media (max-width: 600px)': {
                            height: '250px'
                        },
                    }}
                    onClick={() => setOpen(true)}
                />
                <Dialog open={open} onClose={handleClose} maxWidth='md'> 
                    <DialogContent>
                        <img
                            src={`https://www.pubhist.com${artwork.primaryImageSmall}`}
                            alt={artwork.titleZh || artwork.titleEn}
                            style={{ maxWidth: 'auto', height: 'auto' }}
                        />
                    </DialogContent>
                </Dialog>
            </Grid>
            <Grid container justifyContent="center" sx={{ marginBottom: '10px' }}>
                <Grid item md={6}>
                    <Divider />
                </Grid>
            </Grid>
            <Grid container justifyContent="center">
                <Grid item xs={10} sm={6} md={6}>
                    <Typography sx={titleStyle}>
                        {artwork.titleZh || artwork.titleEn}
                    </Typography>
                    <Typography sx={typographyStyle}><strong>原标题：</strong>{artwork.titleEn}</Typography>
                    <Typography sx={typographyStyle}><strong>创作时间：</strong>{artwork.displayDate}</Typography>
                    <Typography sx={typographyStyle}><strong>创作地点：</strong>{artwork.placeOfOrigin}</Typography>
                    <Typography sx={typographyStyle}><strong>收藏地：</strong>{artwork.collection}</Typography>
                    <Typography sx={typographyStyle}><strong>尺寸：</strong>{artwork.dimension}</Typography>
                    <Typography sx={typographyStyle}><strong>材料：</strong>{artwork.material}</Typography>
                </Grid>
            </Grid>
            <Grid container justifyContent="center" sx={{ marginTop: '20px' }}>
                {extLinks && Object.keys(extLinks).length > 0 && (
                    <Grid item xs={10} sm={6} md={6}>
                        <Typography sx={titleStyle}>外部链接：</Typography>
                        <ul>
                            {Object.keys(extLinks).map((key, index) => (
                                <li key={index}>
                                    <Link href={extLinks[key].url}
                                        target="_self"
                                        rel="noopener noreferrer">
                                        <Typography sx={typographyStyle}>  {extLinks[key].linkName}</Typography>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Grid>
                )}
            </Grid>
            {/* <Grid container justifyContent="center" sx={{ marginTop: '20px' }}>
                {exhibitions.length > 0 && (
                    <Grid item md={6}>
                        <Typography variant="h6">展览信息：</Typography>
                        {exhibitions
                            .filter(exhibition => exhibition.trim() !== "")
                            .map((exhibition, index) => (
                                <li key={index}>
                                    <Typography>{exhibition.trim()}</Typography>
                                </li>
                            ))}
                    </Grid>
                )}
            </Grid> */}

        </Grid >

    );
};

const typographyStyle = {
    fontFamily: 'Microsoft YaHei',
    lineHeight: '1.5',
    fontSize: { xs: 14, md: 14 }
};
const titleStyle = {
    fontWeight: 'bold',
    lineHeight: '2',
    fontFamily: 'Microsoft YaHei',
    fontSize: { xs: 18, md: 18 }
}

export default ArtworkDetailPage;
