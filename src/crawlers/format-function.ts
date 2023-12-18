
function parseInchDimension(dimension: string) {
    const [whole, fraction] = dimension.split(" ");
    const inches = parseInt(whole, 10) + (fraction ? eval(fraction) : 0);
    return inches * 2.54;
}

//35 in x 51 in	 => 26.67 cm x 34.29 cm
function convertDimensionsToCm(dimensionString: string) {
    if (dimensionString) { return '' }

    const [widthIn, heightIn] = dimensionString.toLowerCase().replace('in', '').split('x');
    const widthCm = parseInchDimension(widthIn.trim());
    const heightCm = parseInchDimension(heightIn.trim());
    return `${widthCm.toFixed(2)} cm x ${heightCm.toFixed(2)} cm`;
}