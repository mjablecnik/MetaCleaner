/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Step2_Files_Metadatafieldsmobile2Inputs */

const en_step2_files_metadatafieldsmobile2 = /** @type {(inputs: Step2_Files_Metadatafieldsmobile2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} fields`)
};

const cs_step2_files_metadatafieldsmobile2 = /** @type {(inputs: Step2_Files_Metadatafieldsmobile2Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} polí`)
};

/**
* | output |
* | --- |
* | "{count} fields" |
*
* @param {Step2_Files_Metadatafieldsmobile2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_files_metadatafieldsmobile2 = /** @type {((inputs: Step2_Files_Metadatafieldsmobile2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Files_Metadatafieldsmobile2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_files_metadatafieldsmobile2(inputs)
	return cs_step2_files_metadatafieldsmobile2(inputs)
});
export { step2_files_metadatafieldsmobile2 as "step2.files.metadataFieldsMobile" }