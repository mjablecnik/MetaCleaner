/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Step5_Metadata_Filescount1Inputs */

const en_step5_metadata_filescount1 = /** @type {(inputs: Step5_Metadata_Filescount1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} files`)
};

const cs_step5_metadata_filescount1 = /** @type {(inputs: Step5_Metadata_Filescount1Inputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} soubory`)
};

/**
* | output |
* | --- |
* | "{count} files" |
*
* @param {Step5_Metadata_Filescount1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_filescount1 = /** @type {((inputs: Step5_Metadata_Filescount1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Filescount1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step5_metadata_filescount1(inputs)
	return cs_step5_metadata_filescount1(inputs)
});
export { step5_metadata_filescount1 as "step5.metadata.filesCount" }