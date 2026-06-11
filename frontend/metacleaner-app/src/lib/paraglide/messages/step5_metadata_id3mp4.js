/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step5_Metadata_Id3mp4Inputs */

const en_step5_metadata_id3mp4 = /** @type {(inputs: Step5_Metadata_Id3mp4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ID3 / MP4 atoms`)
};

const cs_step5_metadata_id3mp4 = /** @type {(inputs: Step5_Metadata_Id3mp4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ID3 / MP4 atoms`)
};

/**
* | output |
* | --- |
* | "ID3 / MP4 atoms" |
*
* @param {Step5_Metadata_Id3mp4Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_id3mp4 = /** @type {((inputs?: Step5_Metadata_Id3mp4Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Id3mp4Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_id3mp4(inputs)
	return cs_step5_metadata_id3mp4(inputs)
});
export { step5_metadata_id3mp4 as "step5.metadata.id3mp4" }