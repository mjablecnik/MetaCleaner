/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_ExifInputs */

const en_step5_metadata_exif = /** @type {(inputs: Step5_Metadata_ExifInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`EXIF data`)
};

const cs_step5_metadata_exif = /** @type {(inputs: Step5_Metadata_ExifInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`EXIF data`)
};

/**
* | output |
* | --- |
* | "EXIF data" |
*
* @param {Step5_Metadata_ExifInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_exif = /** @type {((inputs?: Step5_Metadata_ExifInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_ExifInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_exif(inputs)
	return cs_step5_metadata_exif(inputs)
});
export { step5_metadata_exif as "step5.metadata.exif" }