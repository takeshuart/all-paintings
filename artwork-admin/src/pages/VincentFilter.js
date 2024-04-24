import { TextField, IconButton, InputAdornment, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FormControl, FilledInput, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';

//移动端折叠过滤器
export function FilterAccordion(props) {
    const isMobile = useMediaQuery('(max-width:600px)');
    const filterSectionProps = {
        genreSelected: props.genreSelected,
        periodSelected: props.periodSelected,
        techniqueSelected: props.techniqueSelected,
        hasImage: props.hasImage,
        handleGenreChange: props.handleGenreChange,
        handlePeriodChange: props.handlePeriodChange,
        handleTechniqueChange: props.handleTechniqueChange,
        handleHasImageChange: props.handleHasImageChange,
        genresCond: props.genresCond,
        periodCond: props.periodCond,
        techniqueCond: props.techniqueCond,
    };

    if (isMobile) {
        return (
            <Accordion style={{ width: '100%' }}>
                <AccordionSummary expandIcon={<ArrowDownwardIcon />}>
                    <Typography>过滤器</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FilterSection {...filterSectionProps} />
                </AccordionDetails>
            </Accordion>);
    }
    return (<FilterSection {...filterSectionProps} />
    )
}

export function FilterSection({
    genreSelected,
    periodSelected,
    techniqueSelected,
    hasImage,
    handleGenreChange,
    handlePeriodChange,
    handleTechniqueChange,
    handleHasImageChange,
    genresCond,
    periodCond,
    techniqueCond,
}) {
    return (
        <Grid container sx={{ marginTop: '10px', marginBottom: '20px' }}>
            <Grid item xs={12} sm={6} md={3} sx={{ '@media (min-width: 600px)': { marginRight: '20px' } }}>
                <GenreSelect
                    label="主题"
                    value={genreSelected}
                    onChange={handleGenreChange}
                    items={genresCond}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ '@media (min-width: 600px)': { marginRight: '20px' } }}>
                <PeriodSelect
                    label="时期"
                    value={periodSelected}
                    onChange={handlePeriodChange}
                    items={periodCond}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={2} sx={{ '@media (min-width: 600px)': { marginRight: '20px' } }}>
                <TechniqueSelect
                    label="技法类型"
                    value={techniqueSelected}
                    onChange={handleTechniqueChange}
                    items={techniqueCond}
                />
            </Grid>
            <Grid container xs={12} sm={6} md={2} justifyContent="center" alignItems="center">
                <FormGroup>
                    <FormControlLabel
                        control={<Checkbox checked={hasImage} onChange={handleHasImageChange} />}
                        label="有图片"
                    />
                </FormGroup>
            </Grid>
        </Grid>
    );
}

export const SearchInput = ({ value, onChange, onKeyDown, onSearch }) => {
    return (
        <TextField
            variant="standard"
            size="medium"
            fullWidth
            label="作品/博物馆关键词，支持中/英"
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton onClick={onSearch}>
                            <SearchIcon />
                        </IconButton>
                    </InputAdornment>
                )
            }}
        />
    );
};

//TODO 把select抽象出一个通用组件
export const GenreSelect = ({ label, value, onChange, items }) => {
    return (
        <FormControl fullWidth variant="filled" size='small' sx={{ mt: 1 }}>
            <InputLabel id={`${label}-label`}>{label}</InputLabel>
            <Select
                labelId={`${label}-label`}
                value={value}
                onChange={onChange}
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

                {items.map((item) => (
                    <MenuItem key={item.genre} value={item.genre}>
                        {item.genre}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};


export const PeriodSelect = ({ label, value, onChange, items }) => {
    return (
        <FormControl fullWidth variant="filled" size='small' sx={{ mt: 1 }}>
            <InputLabel id={`${label}-label`}>{label}</InputLabel>
            <Select
                labelId={`${label}-label`}
                value={value}
                onChange={onChange}
                input={<FilledInput />}
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 300,
                        }
                    }
                }}
            >
                <MenuItem value="">所有{label}</MenuItem>

                {items.map((item) => (
                    <MenuItem key={item.period} value={item.period}>
                        {item.period}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export const TechniqueSelect = ({ label, value, onChange, items }) => {
    return (
        <FormControl fullWidth variant="filled" size='small' sx={{ mt: 1 }}>
            <InputLabel id={`${label}-label`}>{label}</InputLabel>
            <Select
                labelId={`${label}-label`}
                value={value}
                onChange={onChange}
                input={<FilledInput />}
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 300,
                        }
                    }
                }}
            >
                <MenuItem value="">所有{label}</MenuItem>

                {items.map((item) => (
                    <MenuItem key={item.technique} value={item.technique}>
                        {item.technique}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
