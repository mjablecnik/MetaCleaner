/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_XmpInputs */

const en_step5_metadata_xmp = /** @type {(inputs: Step5_Metadata_XmpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`XMP/IPTC`)
};

const cs_step5_metadata_xmp = /** @type {(inputs: Step5_Metadata_XmpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`XMP/IPTC`)
};

/**
* | output |
* | --- |
* | "XMP/IPTC" |
*
* @param {Step5_Metadata_XmpInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_xmp = /** @type {((inputs?: Step5_Metadata_XmpInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_XmpInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_xmp(inputs)
	return cs_step5_metadata_xmp(inputs)
});
export { step5_metadata_xmp as "step5.metadata.xmp" }