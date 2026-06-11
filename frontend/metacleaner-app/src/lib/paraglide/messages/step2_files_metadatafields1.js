/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Step2_Files_Metadatafields1Inputs */

const en_step2_files_metadatafields1 = /** @type {(inputs: Step2_Files_Metadatafields1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} metadata fields`)
};

const cs_step2_files_metadatafields1 = /** @type {(inputs: Step2_Files_Metadatafields1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} polí metadat`)
};

/**
* | output |
* | --- |
* | "{count} metadata fields" |
*
* @param {Step2_Files_Metadatafields1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_files_metadatafields1 = /** @type {((inputs: Step2_Files_Metadatafields1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Files_Metadatafields1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_files_metadatafields1(inputs)
	return cs_step2_files_metadatafields1(inputs)
});
export { step2_files_metadatafields1 as "step2.files.metadataFields" }