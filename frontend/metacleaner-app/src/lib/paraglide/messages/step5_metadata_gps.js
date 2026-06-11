/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_GpsInputs */

const en_step5_metadata_gps = /** @type {(inputs: Step5_Metadata_GpsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS coordinates`)
};

const cs_step5_metadata_gps = /** @type {(inputs: Step5_Metadata_GpsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`GPS souřadnice`)
};

/**
* | output |
* | --- |
* | "GPS coordinates" |
*
* @param {Step5_Metadata_GpsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_gps = /** @type {((inputs?: Step5_Metadata_GpsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_GpsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_gps(inputs)
	return cs_step5_metadata_gps(inputs)
});
export { step5_metadata_gps as "step5.metadata.gps" }