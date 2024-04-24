import { TextField, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, FilledInput, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

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
