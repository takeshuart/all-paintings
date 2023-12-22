// from JSON format of Artic API
export interface ArticArtWorkInfo {
    data: ArticArtWork; // Contains the main data about the artwork
    info: Info; // Contains information about licensing and API version
    config: Config; // Contains configuration details like URLs
}

export interface ArticArtWork {
    id: number; // Unique identifier of the artwork
    api_model: string; // Type of the API model
    api_link: string; // API link to the artwork details
    is_boosted: boolean; // Indicates if the artwork is boosted in visibility
    title: string; // Title of the artwork
    alt_titles: any; // Alternative titles of the artwork, if any
    thumbnail: Thumbnail; //tiny image
    main_reference_number: string; // inventory number
    has_not_been_viewed_much: boolean; // Indicates if the artwork hasn't been viewed much
    //官网上展示的顺序 https://www.artic.edu/collection
    boost_rank: number; // The boost rank of the artwork
    date_start: number; // Start date of the artwork creation
    date_end: number; // End date of the artwork creation
    date_display: string; // Display format of the creation date
    date_qualifier_title: string; // Qualifier title for the date
    date_qualifier_id: any; // Qualifier ID for the date
    artist_display: string; // Display format of the artist information
    place_of_origin: string; // Place where the artwork originated
    description: string; // Detailed description of the artwork
    short_description: string; // Short description of the artwork
    dimensions: string; // Dimensions of the artwork
    dimensions_detail: DimensionsDetail[]; // Detailed dimensions of the artwork
    medium_display: string; // Medium used in the artwork
    inscriptions: any; // Inscriptions on the artwork, if any
    credit_line: string; // Credit line for the artwork
    catalogue_display: any; // Catalogue display information, if available
    publication_history: string; // Publication history of the artwork
    exhibition_history: string; // Exhibition history of the artwork
    provenance_text: string; // Provenance information of the artwork
    edition: any; // Edition information of the artwork, if applicable
    publishing_verification_level: string; // Level of verification for publishing
    internal_department_id: number; // Internal department ID
    fiscal_year: number; // Fiscal year of acquisition or creation
    fiscal_year_deaccession: any; // Fiscal year of deaccession, if applicable
    is_public_domain: boolean; // Indicates if the artwork is in the public domain
    is_zoomable: boolean; // Indicates if the artwork image is zoomable
    max_zoom_window_size: number; // Maximum size of the zoom window
    copyright_notice: any; // Copyright notice, if applicable
    has_multimedia_resources: boolean; // Indicates if multimedia resources are available
    has_educational_resources: boolean; // Indicates if educational resources are available
    has_advanced_imaging: boolean; // Indicates if advanced imaging is available
    colorfulness: number; // Measure of colorfulness
    color: Color; // Dominant color information
    latitude: number; // Latitude coordinate of the artwork's location
    longitude: number; // Longitude coordinate of the artwork's location
    latlon: string; // Combined latitude and longitude string
    is_on_view: boolean; // Indicates if the artwork is currently on view
    on_loan_display: any; // Information about the artwork being on loan
    gallery_title: string; // Title of the gallery where the artwork is displayed
    gallery_id: number; // Identifier of the gallery
    nomisma_id: any; // Nomisma identifier, if applicable
    artwork_type_title: string; // Title of the artwork type
    artwork_type_id: number; // Identifier of the artwork type
    department_title: string; // Title of the department
    department_id: string; // Identifier of the department
    artist_id: number; // Identifier of the artist
    artist_title: string; // Title of the artist
    alt_artist_ids: any[]; // Alternative artist IDs
    artist_ids: number[]; // Array of artist IDs
    artist_titles: string[]; // Array of artist titles
    category_ids: string[]; // Array of category IDs
    category_titles: string[]; // Array of category titles
    term_titles: string[]; // Array of term titles
    style_id: string; // Identifier of the style
    style_title: string; // Title of the style
    alt_style_ids: any[]; // Alternative style IDs
    style_ids: string[]; // Array of style IDs
    style_titles: string[]; // Array of style titles
    classification_id: string; // Identifier of the classification
    classification_title: string; // Title of the classification
    alt_classification_ids: string[]; // Alternative classification IDs
    classification_ids: string[]; // Array of classification IDs
    classification_titles: string[]; // Array of classification titles
    subject_id: string; // Identifier of the subject
    alt_subject_ids: string[]; // Alternative subject IDs
    subject_ids: string[]; // Array of subject IDs
    subject_titles: string[]; // Array of subject titles
    material_id: string; // Identifier of the material
    alt_material_ids: any[]; // Alternative material IDs
    material_ids: string[]; // Array of material IDs
    material_titles: string[]; // Array of material titles
    technique_id: string; // Identifier of the technique
    alt_technique_ids: string[]; // Alternative technique IDs
    technique_ids: string[]; // Array of technique IDs
    technique_titles: string[]; // Array of technique titles
    theme_titles: string[]; // Array of theme titles
    image_id: string; // Identifier of the image
    alt_image_ids: any[]; // Alternative image IDs
    document_ids: string[]; // Array of document IDs
    sound_ids: string[]; // Array of sound IDs
    video_ids: any[]; // Array of video IDs
    text_ids: any[]; // Array of text IDs
    section_ids: any[]; // Array of section IDs
    section_titles: any[]; // Array of section titles
    site_ids: number[]; // Array of site IDs
    suggest_autocomplete_boosted: string; // Suggestion for autocomplete boosting
    suggest_autocomplete_all: SuggestAutocompleteAll[]; // All autocomplete suggestions
    source_updated_at: string; // Source's last update timestamp
    updated_at: string; // Last updated timestamp
    timestamp: string; // Timestamp of the data
}

export interface Thumbnail {
    lqip: string; // Low-quality image placeholder,base64 image
    width: any; // Width of the thumbnail
    height: any; // Height of the thumbnail
    alt_text: string; // Alternative text for the thumbnail
}

export interface DimensionsDetail {
    depth_cm: number; // Depth of the artwork in centimeters
    depth_in: number; // Depth of the artwork in inches
    width_cm: number; // Width of the artwork in centimeters
    width_in: number; // Width of the artwork in inches
    height_cm: number; // Height of the artwork in centimeters
    height_in: number; // Height of the artwork in inches
    diameter_cm: number; // Diameter of the artwork in centimeters
    diameter_in: number; // Diameter of the artwork in inches
    clarification: any; // Additional clarification about the dimensions
}

export interface Color {
    h: number; // Hue component of the color
    l: number; // Lightness component of the color
    s: number; // Saturation component of the color
    percentage: number; // Percentage of the dominant color
    population: number; // Population count of the color in the image
}

export interface SuggestAutocompleteAll {
    input: string[]; // Input strings for autocomplete
    contexts: Contexts; // Contexts for grouping suggestions
    weight?: number; // Weight of the suggestion
}

export interface Contexts {
    groupings: string[]; // Groupings for the autocomplete contexts
}

export interface Info {
    license_text: string; // Licensing text for the data
    license_links: string[]; // Links to the licensing information
    version: string; // Version of the API or data
}

export interface Config {
    iiif_url: string; // Base URL for the IIIF service
    website_url: string; // URL of the AIC website
}
